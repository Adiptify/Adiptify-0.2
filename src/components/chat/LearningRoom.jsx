import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Loader2, StopCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useOllama } from '../../hooks/useOllama';
import ReactMarkdown from 'react-markdown';

// Using React.memo for high performance rendering of individual chat messages
const ChatMessage = React.memo(({ message, isLatestStreaming }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-6`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gradient-to-br from-adiptify-navy to-slate-700 text-white' : 'bg-gradient-to-br from-adiptify-terracotta to-orange-400 text-white shadow-md'
                }`}>
                {isUser ? <User size={20} /> : <Bot size={20} />}
            </div>

            <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${isUser
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tr-none'
                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                        {message.content ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Thinking...</span>
                            </div>
                        )}
                        {isLatestStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-adiptify-terracotta animate-pulse" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function LearningRoom({ subject, isOpen, onClose }) {
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);

    const { messages, isStreaming, error, sendMessage, stopStreaming } = useOllama();

    // Auto-scroll logic utilizing requestAnimationFrame for smoothness
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const contextPayload = subject ? {
            mastery: subject.mastery,
            weakestModule: subject.weakestModule,
        } : null;

        sendMessage(input, contextPayload);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`fixed z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded
                    ? 'inset-4 rounded-2xl'
                    : 'bottom-4 right-4 w-[450px] h-[600px] rounded-2xl'
                    }`}
            >
                {/* Header */}
                <header className="px-6 py-4 bg-white/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-adiptify-terracotta to-orange-400 flex items-center justify-center text-white shadow-md">
                            <Bot size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-adiptify-navy dark:text-white leading-tight">AI Tutor</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                                {subject ? `Context: ${subject.title}` : 'General Assistance'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
                        >
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
                            <Bot size={48} className="text-slate-200 dark:text-slate-700" />
                            <p className="text-center max-w-xs">
                                I am Adiptify, your intelligent learning assistant. How can I help you master {subject?.title || 'this subject'} today?
                            </p>
                        </div>
                    ) : (
                        <div className="pb-4">
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    message={msg}
                                    isLatestStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
                                />
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}

                    {error && (
                        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 text-center">
                            {error}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question or request an explanation..."
                            className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-adiptify-terracotta/50 focus:bg-white dark:focus:bg-slate-600 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white"
                            disabled={isStreaming}
                        />

                        {isStreaming ? (
                            <button
                                type="button"
                                onClick={stopStreaming}
                                className="absolute right-2 top-2 bottom-2 bg-slate-800 dark:bg-slate-600 text-white rounded-lg px-4 flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors"
                            >
                                <StopCircle size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-adiptify-terracotta text-white rounded-lg px-4 flex items-center justify-center hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-adiptify-terracotta transition-colors shadow-sm"
                            >
                                <Send size={18} className="translate-x-px translate-y-px" />
                            </button>
                        )}
                    </form>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-adiptify-olive animate-pulse"></span>
                            DeepSeek-v3.1 Engine Active
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
