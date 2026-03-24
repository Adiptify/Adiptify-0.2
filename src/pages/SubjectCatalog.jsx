import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Chip, Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, MenuItem, Alert, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { apiFetch } from '../api/client';
import SyllabusUpload from '../components/SyllabusUpload';

const SubjectCatalog = () => {
    const { categories, user, refreshSubjects } = useQuiz();
    const [subjects, setSubjects] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [showManualCreate, setShowManualCreate] = useState(false);

    // Fetch all subjects on mount
    const loadSubjects = async () => {
        try {
            const data = await apiFetch('/api/subjects');
            setSubjects(data);
        } catch (e) {
            console.error("Failed to load subjects", e);
        }
    };

    React.useEffect(() => {
        loadSubjects();
    }, []);

    // State for manual creation & editing
    const [newSubject, setNewSubject] = useState({ name: '', categoryName: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Menu state for cards
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeSubject, setActiveSubject] = useState(null);

    const isOrganization = user?.accountType === 'organization';

    const handleCreateSubject = async () => {
        if (!newSubject.name || !newSubject.categoryName) return;
        setCreating(true);
        try {
            if (isEditing && activeSubject) {
                await apiFetch(`/api/subjects/${activeSubject._id}`, {
                    method: 'PUT',
                    body: { ...newSubject }
                });
            } else {
                await apiFetch('/api/subjects', {
                    method: 'POST',
                    body: { ...newSubject }
                });
            }
            await loadSubjects();
            refreshSubjects?.(); // Just in case we need to update enrolled ones in context
            setShowManualCreate(false);
            setNewSubject({ name: '', categoryName: '', description: '' });
            setIsEditing(false);
            setActiveSubject(null);
        } catch (e) {
            console.error("Failed to create subject", e);
            alert(e.message || "Failed to create subject");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (subjectId) => {
        setAnchorEl(null);
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            await apiFetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
            await loadSubjects();
            refreshSubjects?.();
        } catch (e) {
            alert(e.message || "Failed to delete");
        }
    };

    // Group subjects by category safely
    const grouped = (subjects || []).reduce((acc, sub) => {
        const catName = sub.category?.name || "Uncategorized";
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(sub);
        return acc;
    }, {});

    return (
        <Container className="mt-4 pb-5">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Subject Catalog
                </Typography>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" onClick={() => setShowManualCreate(true)}>
                        {isOrganization && user?.role === 'student' ? 'Suggest Subject' : '+ New Subject'}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setShowUpload(!showUpload)}>
                        {showUpload ? 'Close Upload' : 'Upload Syllabus'}
                    </Button>
                </Box>
            </Box>

            {showUpload && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <SyllabusUpload onComplete={() => setShowUpload(false)} />
                </motion.div>
            )}

            {Object.entries(grouped).map(([catName, subs]) => (
                <Box key={catName} mb={5}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ borderBottom: '2px solid #eaeaea', pb: 1, mb: 3 }}>
                        {catName}
                    </Typography>
                    <Grid container spacing={3}>
                        {subs.map((subject, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={subject._id}>
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                                    <Card sx={{
                                        borderRadius: 3,
                                        height: '100%',
                                        borderTop: `6px solid ${subject.metadata?.color || '#333'}`
                                    }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {subject.metadata?.icon || "📚"} {subject.name}
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {subject.status === 'pending' && <Chip size="small" label="Pending" color="warning" />}
                                                    {(user?.role === 'admin' || subject.createdBy === user?._id || isOrganization) && (
                                                        <IconButton size="small" onClick={(e) => {
                                                            setAnchorEl(e.currentTarget);
                                                            setActiveSubject(subject);
                                                        }}>
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary" mb={2}>
                                                {subject.description || "No description provided."}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}

            {subjects.length === 0 && !showUpload && (
                <Alert severity="info">No subjects found. Start by creating a subject or uploading a syllabus!</Alert>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => {
                    setAnchorEl(null);
                    setNewSubject({
                        name: activeSubject.name,
                        categoryName: activeSubject.category?.name || activeSubject.category || '',
                        description: activeSubject.description || ''
                    });
                    setIsEditing(true);
                    setShowManualCreate(true);
                }}>Edit Subject</MenuItem>
                <MenuItem onClick={() => activeSubject && handleDelete(activeSubject._id)} sx={{ color: 'error.main' }}>Delete Subject</MenuItem>
            </Menu>

            {/* Manual Create Modal */}
            <Dialog open={showManualCreate} onClose={() => {
                if (!creating) {
                    setShowManualCreate(false);
                    setIsEditing(false);
                    setNewSubject({ name: '', categoryName: '', description: '' });
                }
            }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {isEditing ? 'Edit Subject' : (isOrganization && user?.role === 'student' ? 'Suggest a Subject' : 'Create New Subject')}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="Subject Name" margin="normal"
                        value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                    />
                    <TextField
                        fullWidth label="Category Name" margin="normal"
                        value={newSubject.categoryName} onChange={e => setNewSubject({ ...newSubject, categoryName: e.target.value })}
                        helperText="Type a new category or select an existing one below"
                    />
                    <Box mt={1} mb={2} display="flex" gap={1} flexWrap="wrap">
                        {categories.map(c => (
                            <Chip
                                key={c._id}
                                label={c.name}
                                clickable
                                color={newSubject.categoryName === c.name ? "primary" : "default"}
                                onClick={() => setNewSubject({ ...newSubject, categoryName: c.name })}
                            />
                        ))}
                    </Box>
                    <TextField
                        fullWidth label="Description" margin="normal" multiline rows={3}
                        value={newSubject.description} onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowManualCreate(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateSubject} disabled={creating || !newSubject.name || !newSubject.categoryName}>
                        {creating ? <CircularProgress size={20} /> : (isEditing ? 'Save Changes' : 'Submit')}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default SubjectCatalog;
