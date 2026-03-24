import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Target, BrainCircuit, Activity, BookOpen, Share2, Layers, RefreshCcw, FlaskConical, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DeepDivePanel({ subject, onClose, onEnterLearningRoom }) {
    const navigate = useNavigate();

    if (!subject) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl z-30 flex flex-col border-l border-slate-100 dark:border-slate-700"
            >
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-adiptify-navy dark:text-white">{subject.title}</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-adiptify-olive"></span>
                            {subject.mastery}% EMA Mastery
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

                    {/* Weakest Area Alert */}
                    <div className="bg-adiptify-gold/10 border border-adiptify-gold/20 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-adiptify-navy dark:text-adiptify-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Target size={16} className="text-adiptify-terracotta" />
                            Focus Area Identified
                        </h3>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                            Your mastery in <span className="font-semibold text-adiptify-navy dark:text-white">"{subject.weakestModule}"</span> is currently tracking below ideal threshold.
                            The Learning Room is calibrated to prioritize foundations here.
                        </p>
                    </div>

                    {/* Module Metrics */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Explore Subject Modules</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click a module to explore it in the interactive Mind Map.</p>
                        <div className="space-y-4">
                            <MetricBar 
                                icon={<BrainCircuit size={18} />} 
                                label="Interest" 
                                value={subject.modules.interest} 
                                color="bg-adiptify-navy"
                                onClick={() => navigate('/graph', { state: { topic: `${subject.title} Interest` } })}
                            />
                            <MetricBar 
                                icon={<BookOpen size={18} />} 
                                label="Research" 
                                value={subject.modules.research} 
                                color="bg-adiptify-olive"
                                onClick={() => navigate('/graph', { state: { topic: `${subject.title} Research` } })}
                            />
                            <MetricBar 
                                icon={<Activity size={18} />} 
                                label="Practice" 
                                value={subject.modules.practice} 
                                color="bg-adiptify-terracotta"
                                onClick={() => navigate('/graph', { state: { topic: `${subject.title} Practice` } })}
                            />
                            <MetricBar 
                                icon={<Target size={18} />} 
                                label="Goals" 
                                value={subject.modules.goals} 
                                color="bg-adiptify-gold"
                                onClick={() => navigate('/graph', { state: { topic: `${subject.title} Goals` } })}
                            />
                        </div>

                        {subject.isEnrolled && (
                            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Enrolled Features</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => navigate('/modules')} 
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-colors"
                                    >
                                        <Layers size={20} className="text-adiptify-navy dark:text-adiptify-gold" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Study Modules</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/review')} 
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-colors"
                                    >
                                        <RefreshCcw size={20} className="text-adiptify-olive" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Spaced Review</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/lab')} 
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-colors"
                                    >
                                        <FlaskConical size={20} className="text-adiptify-terracotta" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Experiment Lab</span>
                                    </button>
                                    <button 
                                        onClick={() => navigate('/analytics')} 
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-600 transition-colors"
                                    >
                                        <BarChart2 size={20} className="text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Analytics</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Explore Topic Button (Graph Explorer) */}
                <div className="px-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 pt-4">
                    <button
                        onClick={() => navigate('/graph', { state: { topic: subject.title } })}
                        className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold tracking-wide hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 flex justify-center items-center gap-2 group"
                    >
                        Explore in Mind Map
                        <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* CTA Button */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <button
                        onClick={onEnterLearningRoom}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-adiptify-terracotta to-orange-500 text-white font-bold tracking-wide shadow-lg shadow-adiptify-terracotta/30 hover:shadow-adiptify-terracotta/50 hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 group"
                    >
                        Enter Learning Room
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function MetricBar({ icon, label, value, color, onClick }) {
    return (
        <div 
            className={`flex items-center gap-4 ${onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 -mx-2 rounded-lg transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600 ${onClick ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${color}`}
                    />
                </div>
            </div>
        </div>
    );
}
