import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Stepper, Step, StepLabel, Checkbox, FormControlLabel } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { apiFetch } from '../api/client';
import { useQuiz } from '../context/QuizContext';

const SyllabusUpload = ({ onComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadId, setUploadId] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, extracted, confirmed, error
    const [error, setError] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);

    const { loadUserData } = useQuiz();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setError(null);
            setStatus('idle');
            setAiResult(null);
        }
    };

    const startUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus('uploading');
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('adiptify_token');
            const res = await fetch('http://localhost:4000/api/syllabus/upload', {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Upload failed');
            }

            const data = await res.json();
            setUploadId(data.uploadId);
            setStatus('processing');
            pollStatus(data.uploadId);
        } catch (err) {
            setError(err.message);
            setStatus('error');
            setUploading(false);
        }
    };

    const pollStatus = async (id) => {
        const interval = setInterval(async () => {
            try {
                const data = await apiFetch(`/api/syllabus/${id}`);
                if (data.status === 'extracted') {
                    clearInterval(interval);
                    setAiResult(data);
                    setSelectedTopics(data.extractedTopics.map(t => t.name));
                    setStatus('extracted');
                    setUploading(false);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setError('AI extraction failed to process this document.');
                    setStatus('error');
                    setUploading(false);
                }
            } catch (err) {
                clearInterval(interval);
                setError('Failed to check status.');
                setStatus('error');
                setUploading(false);
            }
        }, 3000);
    };

    const toggleTopic = (name) => {
        setSelectedTopics(prev =>
            prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
        );
    };

    const confirmTopics = async () => {
        if (!uploadId) return;
        setStatus('uploading');
        try {
            await apiFetch(`/api/syllabus/${uploadId}/confirm`, {
                method: 'POST',
                body: { selectedTopics }
            });
            setStatus('confirmed');
            await loadUserData(); // Refresh subjects
            if (onComplete) onComplete();
        } catch (err) {
            setError(err.message);
            setStatus('extracted');
        }
    };

    const steps = ['Upload Syllabus', 'AI Extraction', 'Confirm Topics'];
    const activeStep = ['idle', 'uploading'].includes(status) ? 0
        : status === 'processing' ? 1
            : status === 'extracted' ? 2 : 3;

    return (
        <Paper sx={{ p: 3, borderRadius: 3, my: 3, border: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Upload Syllabus or Curriculum
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
                Upload a PDF, DOCX, or TXT file. Our AI will analyze the document, summarize it, and extract the core topics for your curriculum.
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {status === 'idle' || status === 'uploading' ? (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4} border="2px dashed #ccc" borderRadius={2}>
                    <input
                        accept=".pdf,.docx,.txt,application/pdf,text/plain"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<UploadFile />} disabled={uploading}>
                            {file ? file.name : "Select File"}
                        </Button>
                    </label>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload & Analyze"}
                    </Button>
                </Box>
            ) : null}

            {status === 'processing' && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={4}>
                    <CircularProgress />
                    <Typography>AI is reading and finding topics... This may take up to a minute.</Typography>
                </Box>
            )}

            {status === 'extracted' && aiResult && (
                <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>Extraction complete!</Alert>

                    <Typography variant="subtitle1" fontWeight="bold">AI Summary:</Typography>
                    <Typography variant="body2" sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {aiResult.summary}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>Select topics to add as subjects:</Typography>
                    <Box display="flex" flexDirection="column" gap={1} mb={3}>
                        {aiResult.extractedTopics.map((t, idx) => (
                            <FormControlLabel
                                key={idx}
                                control={<Checkbox checked={selectedTopics.includes(t.name)} onChange={() => toggleTopic(t.name)} />}
                                label={`${t.name} (${t.category}) - Confidence: ${Math.round(t.confidence * 100)}%`}
                            />
                        ))}
                    </Box>

                    <Button variant="contained" color="secondary" onClick={confirmTopics} disabled={selectedTopics.length === 0}>
                        Confirm Selected Topics
                    </Button>
                </Box>
            )}

            {status === 'confirmed' && (
                <Alert severity="success">
                    Topics confirmed! They are now available in your subject catalog.
                </Alert>
            )}
        </Paper>
    );
};

export default SyllabusUpload;
