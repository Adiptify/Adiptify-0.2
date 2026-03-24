import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Cloud, Plus, MessageSquare, Trash2, Library, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { apiFetch } from '../api/client';

const AITutorPage = () => {
    const { user } = useQuiz();
    const ollamaModel = "deepseek-r1"; // Mocked display name
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const navigate = useNavigate();

    // Optional integration with a subject
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const parseGraphLinks = (text) => {
        if (!text) return null;
        const parts = text.split(/(<GRAPH>.*?<\/GRAPH>)/s);
        return parts.map((part, index) => {
            if (part.startsWith('<GRAPH>') && part.endsWith('</GRAPH>')) {
                const topic = part.slice(7, -8).trim();
                return (
                    <button
                        key={index}
                        onClick={() => navigate('/graph', { state: { autoExpandTopic: topic } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-adiptify-gold/10 hover:bg-adiptify-gold/20 text-adiptify-gold border border-adiptify-gold/30 rounded-lg text-sm font-semibold transition-colors mt-2"
                    >
                        <Network size={14} /> Explore {topic} in Graph
                    </button>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    useEffect(() => {
        loadSessions();
        loadSubjects();
    }, []);

    useEffect(() => {
        if (activeSessionId) {
            loadMessages(activeSessionId);
        } else {
            setMessages([{ sender: 'ai', content: 'Hello! Select a conversation or start a new one to begin learning.' }]);
        }
    }, [activeSessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadSubjects = async () => {
        try {
            const data = await apiFetch('/api/subjects');
            setSubjects(data);
        } catch (e) {
            console.error("Failed to load subjects", e);
        }
    };

    const loadSessions = async () => {
        try {
            const data = await apiFetch('/api/chat/sessions');
            setSessions(data);
        } catch (e) {
            console.error("Failed to load sessions", e);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const data = await apiFetch(`/api/chat/sessions/${sessionId}/messages`);
            setMessages(data);
        } catch (e) {
            console.error("Failed to load messages", e);
        }
    };

    const handleNewSession = async () => {
        try {
            const session = await apiFetch('/api/chat/sessions', {
                method: 'POST',
                body: { subjectId: selectedSubjectId || null, title: 'New Conversation' }
            });
            setSessions([session, ...sessions]);
            setActiveSessionId(session._id);
        } catch (e) {
            console.error("New session failed", e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        let sessionId = activeSessionId;

        // If no active session, create one first implicitly
        if (!sessionId) {
            try {
                const session = await apiFetch('/api/chat/sessions', {
                    method: 'POST',
                    body: { subjectId: selectedSubjectId || null, title: input.substring(0, 30) }
                });
                setSessions([session, ...sessions]);
                sessionId = session._id;
                setActiveSessionId(sessionId);
            } catch (e) {
                console.error("New session failed", e);
                return;
            }
        }

        const userMessage = { sender: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // We use the new persistent API endpoint, NOT the raw ollama browser here
            // because we want the backend to persist it.
            const response = await apiFetch(`/api/chat/sessions/${sessionId}/message`, {
                method: 'POST',
                body: { message: userMessage.content }
            });

            const aiResponse = response.reply;
            const messageContent = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.content || 'No response content');

            setMessages(prev => [...prev, { sender: 'ai', content: messageContent }]);

            // Reload sessions to update the title if it changed
            loadSessions();
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                sender: 'ai',
                content: `⚠️ Error: Could not connect to AI backend. Make sure the server and Ollama are running.`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900">
            {/* Sidebar for Sessions */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleNewSession}
                        className="w-full flex items-center justify-center gap-2 bg-adiptify-navy hover:bg-adiptify-navy/90 text-white py-2 px-4 rounded-xl transition-colors shadow-sm text-sm font-medium"
                    >
                        <Plus size={16} /> New Chat
                    </button>

                    {/* Optional Subject Context Selector */}
                    <div className="mt-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Context Subject</label>
                        <select
                            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm p-2 text-slate-700 dark:text-slate-300"
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                        >
                            <option value="">General (No Subject)</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mt-2 mb-2">Past Conversations</p>
                    {sessions.map(s => (
                        <button
                            key={s._id}
                            onClick={() => setActiveSessionId(s._id)}
                            className={`w-full flex flex-col text-left px-3 py-2 rounded-xl transition-all ${activeSessionId === s._id ? 'bg-slate-100 dark:bg-slate-800 text-adiptify-navy dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                        >
                            <span className="text-sm font-medium truncate">{s.title || "New Conversation"}</span>
                            {s.subjectId && (
                                <span className="text-[10px] flex items-center gap-1 mt-1 opacity-70">
                                    <Library size={10} /> {s.subjectId.name}
                                </span>
                            )}
                        </button>
                    ))}
                    {sessions.length === 0 && (
                        <p className="text-xs text-slate-400 text-center mt-4">No history found</p>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-adiptify-navy/10 dark:bg-adiptify-gold/20 text-adiptify-navy dark:text-adiptify-gold flex items-center justify-center">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-white leading-tight">AI Study Tutor</h2>
                            <p className="text-xs text-slate-500">Model: {ollamaModel}</p>
                        </div>
                    </div>
                    {/* Link to Graph */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/graph')}
                            className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            title="Explore in Graph"
                        >
                            <Network size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                    {messages.length === 0 && !activeSessionId && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <Bot size={48} className="mb-4" />
                            <p>How can I help you study today?</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i}
                            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-adiptify-navy/10 dark:bg-adiptify-gold/20 flex-shrink-0 mr-3 flex items-center justify-center text-adiptify-navy dark:text-adiptify-gold mt-1">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className="max-w-[75%]">
                                <div className={`px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${m.sender === 'user'
                                    ? 'bg-adiptify-navy text-white rounded-2xl rounded-tr-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700'
                                    }`}>
                                    {m.sender === 'ai' ? parseGraphLinks(m.content) : m.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-adiptify-navy/10 dark:bg-adiptify-gold/20 flex-shrink-0 mr-3 flex items-center justify-center text-adiptify-navy dark:text-adiptify-gold mt-1">
                                <Bot size={16} />
                            </div>
                            <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-slate-400" />
                                <span className="text-sm text-slate-400">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 pt-4 pb-6">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 group">
                        <textarea
                            rows={1}
                            placeholder="Ask a question or request an explanation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            disabled={isTyping}
                            className="w-full min-h-[56px] max-h-[200px] resize-y rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all disabled:opacity-50 text-[15px] custom-scrollbar shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={isTyping || !input.trim()}
                            className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 flex items-center justify-center hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400"
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
                        </button>
                    </form>
                    <p className="text-center text-xs text-slate-400 mt-2">AI can make mistakes. Verify important information.</p>
                </div>
            </div>
        </div>
    );
};

export default AITutorPage;
