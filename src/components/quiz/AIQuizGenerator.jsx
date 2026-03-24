import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../../context/QuizContext';
import { apiFetch } from '../../api/client';
import { Sparkles, Loader2, AlertCircle, Bot } from 'lucide-react';

const AIQuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { addQuiz } = useQuiz();

    const generateQuiz = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setError(null);
        setSuccess(false);

        try {
            await apiFetch('/api/ai/generate', {
                method: 'POST',
                body: { topic: topic.trim(), count: 5, saveToBank: true }
            });
            addQuiz(); // triggers refetch from backend
            setTopic('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('AI Generation Error:', err);
            setError('Generation failed. Make sure the AI backend (Ollama) is running and the backend server is connected.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-adiptify-gold to-adiptify-terracotta" />

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-adiptify-gold" size={20} />
                            <h3 className="text-lg font-bold text-adiptify-navy dark:text-white">AI Quiz Generator</h3>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-3 py-1">
                            <Bot size={12} />
                            Powered by Ollama
                        </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Enter a topic to generate a 5-question AI quiz, saved directly to the question bank.
                    </p>

                    {/* Input row */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. History of Rome, Python Basics..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isGenerating}
                            onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
                        />
                        <button
                            onClick={generateQuiz}
                            disabled={isGenerating || !topic.trim()}
                            className="px-5 py-2.5 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>

                    {/* Success */}
                    {success && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">✓ Quiz generated and saved! It will now appear in the list below.</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AIQuizGenerator;
