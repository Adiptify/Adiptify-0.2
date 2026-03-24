import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../context/QuizContext';
import { apiFetch } from '../../api/client';
import { Bot, X, Send, Loader2, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AITutor = () => {
    const { user } = useQuiz();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Study Tutor. Ask me anything about your quizzes!' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const parseGraphLinks = (text) => {
        const parts = text.split(/(<GRAPH>.*?<\/GRAPH>)/s);
        return parts.map((part, index) => {
            if (part.startsWith('<GRAPH>') && part.endsWith('</GRAPH>')) {
                const topic = part.slice(7, -8).trim();
                return (
                    <button
                        key={index}
                        onClick={() => navigate('/graph', { state: { autoExpandTopic: topic } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-adiptify-gold/10 hover:bg-adiptify-gold/20 text-adiptify-gold border border-adiptify-gold/30 rounded-lg text-xs font-semibold transition-colors mt-2"
                    >
                        <Network size={12} /> Explore {topic} in Graph
                    </button>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        let sessionId = activeSessionId;
        const userText = input;

        // Create a new session if none exists
        if (!sessionId) {
            try {
                const newSession = await apiFetch('/api/chat/sessions', {
                    method: 'POST',
                    body: { title: userText.substring(0, 30) }
                });
                sessionId = newSession._id;
                setActiveSessionId(sessionId);
            } catch (err) {
                console.error("Failed to create session", err);
            }
        }

        const userMessage = { role: 'user', content: userText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await apiFetch(`/api/chat/sessions/${sessionId}/message`, {
                method: 'POST',
                body: { message: userText }
            });

            const aiResponse = response.reply;
            const messageContent = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.content || 'No response content');

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: messageContent
            }]);

        } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Connection Error: Failed to reach the AI backend.`
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="fixed bottom-5 right-5 z-50"
                >
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 rounded-full bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 shadow-xl hover:shadow-2xl flex items-center justify-center transition-all"
                    >
                        <Bot size={24} />
                    </button>
                </motion.div>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-5 right-5 z-[60] w-[360px] max-w-[90vw]"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
                            {/* Header */}
                            <div className="bg-adiptify-navy dark:bg-slate-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <Bot size={20} />
                                    <div>
                                        <p className="text-sm font-bold leading-tight">AI Study Tutor</p>
                                        <p className="text-[10px] text-white/60 flex items-center gap-1">
                                            Online & Saved
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Reset session on close so user gets fresh start next time
                                        setActiveSessionId(null);
                                        setMessages([{ role: 'assistant', content: 'Hello! I am your AI Study Tutor. Ask me anything about your quizzes!' }]);
                                    }}
                                    className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className="max-w-[85%]">
                                            <div className={`px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                                                ? 'bg-adiptify-navy text-white rounded-2xl rounded-br-sm'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
                                                }`}>
                                                {m.role === 'assistant' ? parseGraphLinks(m.content) : m.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] px-3 py-2 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin text-slate-400" />
                                            <span className="text-sm text-slate-400">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2 flex-shrink-0">
                                <input
                                    type="text"
                                    placeholder="Ask a question..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isTyping}
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isTyping || !input.trim()}
                                    className="w-9 h-9 rounded-xl bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 flex items-center justify-center hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all disabled:opacity-50"
                                >
                                    {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AITutor;
