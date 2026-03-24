import React, { useState, useMemo } from 'react';
import { useAdaptify } from '../context/AdaptifyContext';
import { RotateCcw, Zap, CheckCircle2, Brain, ChevronRight, RefreshCw, Calendar } from 'lucide-react';

const QUALITY_BUTTONS = [
    { score: 0, label: 'Blackout', desc: 'No recall', color: 'bg-red-500 hover:bg-red-600' },
    { score: 1, label: 'Wrong', desc: 'Incorrect, recognized', color: 'bg-red-400 hover:bg-red-500' },
    { score: 2, label: 'Hard', desc: 'Incorrect, seemed easy', color: 'bg-orange-400 hover:bg-orange-500' },
    { score: 3, label: 'Difficult', desc: 'Correct with difficulty', color: 'bg-amber-400 hover:bg-amber-500' },
    { score: 4, label: 'Good', desc: 'Correct, some thought', color: 'bg-emerald-400 hover:bg-emerald-500' },
    { score: 5, label: 'Easy', desc: 'Perfect recall', color: 'bg-emerald-500 hover:bg-emerald-600' },
];

function Flashcard({ concept, onRate, isFlipped, onFlip }) {
    return (
        <div className="perspective-1000 w-full max-w-xl mx-auto" style={{ perspective: '1000px' }}>
            <div className={`relative w-full min-h-[280px] transition-transform duration-500 cursor-pointer`} onClick={onFlip} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl p-8 bg-gradient-to-br from-adiptify-navy to-slate-700 text-white flex flex-col justify-center items-center shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                    <span className="text-[10px] uppercase tracking-widest text-adiptify-gold/80 font-semibold mb-4">{concept.category}</span>
                    <h3 className="text-2xl font-bold text-center mb-3">{concept.title}</h3>
                    <p className="text-sm text-slate-300 text-center max-w-sm">{concept.description}</p>
                    <p className="mt-6 text-xs text-slate-400 flex items-center gap-1"><RotateCcw size={12} /> Tap to reveal answer</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 rounded-2xl p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col justify-center overflow-y-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-3">Explanation</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{concept.pipeline?.explanation || concept.description}</p>
                    {concept.pipeline?.practiceQuestions?.[0] && (
                        <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/40 dark:border-blue-500/20">
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Quick Check: {concept.pipeline.practiceQuestions[0].question}</p>
                            <p className="text-[10px] text-blue-500 dark:text-blue-400/70 mt-1">Answer: {concept.pipeline.practiceQuestions[0].options[concept.pipeline.practiceQuestions[0].correctAnswer]}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SpacedReview() {
    const { dueReviews, concepts, submitReview } = useAdaptify();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewed, setReviewed] = useState([]);
    const [sessionStats, setSessionStats] = useState({ total: 0, avgQuality: 0 });

    const reviewItems = useMemo(() => {
        if (dueReviews.length > 0) {
            return dueReviews.map(r => ({
                ...r,
                concept: r.concept || concepts.find(c => c.conceptId === r.conceptId) || { title: r.conceptId, description: '', category: 'Unknown', pipeline: {} },
            }));
        }
        // If no due reviews, show all concepts as reviewable
        return concepts.map(c => ({
            conceptId: c.conceptId,
            concept: c,
            easiness_factor: 2.5,
            interval: 0,
            repetition: 0,
        }));
    }, [dueReviews, concepts]);

    const remaining = reviewItems.filter(r => !reviewed.includes(r.conceptId));
    const current = remaining[0];

    const handleRate = async (quality) => {
        if (!current) return;
        await submitReview(current.conceptId, quality);
        setReviewed(prev => [...prev, current.conceptId]);
        setSessionStats(prev => ({
            total: prev.total + 1,
            avgQuality: ((prev.avgQuality * prev.total) + quality) / (prev.total + 1),
        }));
        setIsFlipped(false);
    };

    const resetSession = () => {
        setReviewed([]);
        setCurrentIdx(0);
        setSessionStats({ total: 0, avgQuality: 0 });
    };

    // Session complete
    if (!current || remaining.length === 0) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                        <CheckCircle2 size={36} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Review Session Complete! 🎉</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        You reviewed <span className="font-semibold text-slate-700 dark:text-slate-200">{sessionStats.total}</span> concepts
                        with an average quality of <span className="font-semibold text-slate-700 dark:text-slate-200">{sessionStats.avgQuality.toFixed(1)}/5</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sessionStats.total}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cards Reviewed</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sessionStats.avgQuality.toFixed(1)}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Quality</p>
                        </div>
                    </div>
                    <button onClick={resetSession} className="px-6 py-2.5 rounded-xl bg-adiptify-navy dark:bg-slate-700 text-white font-medium text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 mx-auto">
                        <RefreshCw size={16} /> Start New Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header */}
            <header className="px-8 py-6 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-adiptify-navy dark:text-slate-100 tracking-tight flex items-center gap-3">
                            <Brain className="text-purple-500" size={28} />
                            Spaced Review
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">SM-2 algorithm-powered memory optimization.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20">
                            <Calendar size={14} className="text-purple-500" />
                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">{remaining.length} cards remaining</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                            <Zap size={14} className="text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{reviewed.length} reviewed</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-adiptify-gold transition-all duration-500" style={{ width: `${reviewItems.length > 0 ? (reviewed.length / reviewItems.length) * 100 : 0}%` }} />
                </div>
            </header>

            {/* Flashcard Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                <Flashcard concept={current.concept} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />

                {/* Quality Rating */}
                {isFlipped && (
                    <div className="w-full max-w-xl animate-fadeIn">
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3 font-medium uppercase tracking-wider">How well did you recall this?</p>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {QUALITY_BUTTONS.map(btn => (
                                <button key={btn.score} onClick={() => handleRate(btn.score)} className={`${btn.color} text-white rounded-xl p-2.5 text-center transition-all hover:scale-105 hover:shadow-md`}>
                                    <p className="text-sm font-bold">{btn.score}</p>
                                    <p className="text-[10px] font-medium opacity-90">{btn.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!isFlipped && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5"><RotateCcw size={12} /> Click the card to reveal the answer, then rate your recall</p>
                )}
            </div>
        </div>
    );
}
