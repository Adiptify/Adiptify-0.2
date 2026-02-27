import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Target, BrainCircuit, Activity, BookOpen } from 'lucide-react';

export default function DeepDivePanel({ subject, onClose, onEnterLearningRoom }) {
    if (!subject) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-30 flex flex-col border-l border-slate-100"
            >
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-md sticky top-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-adiptify-navy">{subject.title}</h2>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-adiptify-olive"></span>
                            {subject.mastery}% EMA Mastery
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

                    {/* Weakest Area Alert */}
                    <div className="bg-adiptify-gold/10 border border-adiptify-gold/20 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-adiptify-navy uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Target size={16} className="text-adiptify-terracotta" />
                            Focus Area Identified
                        </h3>
                        <p className="text-slate-700 text-sm">
                            Your mastery in <span className="font-semibold text-adiptify-navy">"{subject.weakestModule}"</span> is currently tracking below ideal threshold.
                            The Learning Room is calibrated to prioritize foundations here.
                        </p>
                    </div>

                    {/* Module Metrics */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Module Metrics</h3>
                        <div className="space-y-4">
                            <MetricBar icon={<BrainCircuit size={18} />} label="Interest" value={subject.modules.interest} color="bg-adiptify-navy" />
                            <MetricBar icon={<BookOpen size={18} />} label="Research" value={subject.modules.research} color="bg-adiptify-olive" />
                            <MetricBar icon={<Activity size={18} />} label="Practice" value={subject.modules.practice} color="bg-adiptify-terracotta" />
                            <MetricBar icon={<Target size={18} />} label="Goals" value={subject.modules.goals} color="bg-adiptify-gold" />
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="p-6 border-t border-slate-100 bg-white">
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

function MetricBar({ icon, label, value, color }) {
    return (
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <span className="text-xs font-bold text-slate-500">{value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
