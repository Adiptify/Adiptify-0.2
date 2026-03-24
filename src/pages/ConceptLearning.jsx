import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdaptify } from '../context/AdaptifyContext';
import { ArrowLeft, BookOpen, Play, PenTool, Rocket, CheckCircle2, ChevronRight, Lightbulb, Clock, AlertTriangle, Trophy } from 'lucide-react';

const STAGES = [
    { key: 'explain', label: 'Explain', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500' },
    { key: 'demo', label: 'Demo', icon: Play, color: 'text-purple-500', bg: 'bg-purple-500' },
    { key: 'practice', label: 'Practice', icon: PenTool, color: 'text-amber-500', bg: 'bg-amber-500' },
    { key: 'apply', label: 'Apply', icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { key: 'evaluate', label: 'Evaluate', icon: CheckCircle2, color: 'text-red-500', bg: 'bg-red-500' },
];

function StepperBar({ currentStage, onStageClick }) {
    return (
        <div className="flex items-center gap-1 px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
            {STAGES.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i === currentStage;
                const isComplete = i < currentStage;
                return (
                    <React.Fragment key={stage.key}>
                        <button onClick={() => onStageClick(i)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isActive ? `${stage.bg}/10 font-semibold shadow-sm` : isComplete ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? `${stage.bg} text-white shadow-md` : isComplete ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                {isComplete ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs hidden sm:inline ${isActive ? stage.color : isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{stage.label}</span>
                        </button>
                        {i < STAGES.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${isComplete ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function ExplainSection({ concept }) {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200/40 dark:border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3"><BookOpen size={20} /> Concept Explanation</h3>
                <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed whitespace-pre-wrap">{concept.pipeline?.explanation || 'No explanation available.'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Key Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"><span className="text-slate-400 dark:text-slate-500">Category</span><p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{concept.category}</p></div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"><span className="text-slate-400 dark:text-slate-500">Difficulty</span><p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">Level {concept.difficulty_level}/5</p></div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"><span className="text-slate-400 dark:text-slate-500">Prerequisites</span><p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{concept.prerequisites?.length > 0 ? concept.prerequisites.join(', ') : 'None'}</p></div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"><span className="text-slate-400 dark:text-slate-500">Tags</span><p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{concept.tags?.join(', ') || 'N/A'}</p></div>
                </div>
            </div>
        </div>
    );
}

function DemoSection({ concept }) {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/30 dark:from-purple-500/10 dark:to-purple-500/5 border border-purple-200/40 dark:border-purple-500/20">
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-3"><Play size={20} /> Interactive Demonstration</h3>
                <p className="text-sm text-purple-900/80 dark:text-purple-200/80 leading-relaxed">{concept.pipeline?.demonstration || 'No demonstration available.'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                <div className="w-full h-48 rounded-xl bg-gradient-to-br from-purple-100/40 to-blue-100/40 dark:from-purple-500/10 dark:to-blue-500/10 flex items-center justify-center border border-purple-200/20 dark:border-purple-500/10">
                    <div className="text-center">
                        <Play size={36} className="mx-auto text-purple-400 mb-2" />
                        <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">Interactive visualization loads here</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Check the Experiment Lab for hands-on simulators</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PracticeSection({ concept, onComplete }) {
    const questions = concept.pipeline?.practiceQuestions || [];
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const startTime = useRef(Date.now());

    if (questions.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <PenTool size={48} className="mx-auto mb-3 opacity-30" />
                <p>No practice questions available for this concept.</p>
            </div>
        );
    }

    const q = questions[currentQ];
    const selected = answers[currentQ];
    const isCorrect = selected === q.correctAnswer;
    const allAnswered = Object.keys(answers).length === questions.length;
    const totalCorrect = Object.entries(answers).filter(([i, a]) => a === questions[i].correctAnswer).length;

    const handleAnswer = (optionIdx) => {
        if (answers[currentQ] !== undefined) return;
        setAnswers(prev => ({ ...prev, [currentQ]: optionIdx }));
        setShowHint(false);
    };

    const handleFinish = () => {
        const timeTaken = Date.now() - startTime.current;
        onComplete({
            correct: totalCorrect,
            total: questions.length,
            timeTakenMs: timeTaken,
            hintUsage: hintsUsed,
        });
    };

    if (showResult) {
        return (
            <div className="p-8 text-center animate-fadeIn">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/40">
                    <Trophy size={36} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Practice Complete</h3>
                <p className="text-3xl font-black text-adiptify-gold mb-1">{totalCorrect}/{questions.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    {totalCorrect === questions.length ? 'Perfect score! 🎉' : totalCorrect >= questions.length * 0.7 ? 'Great job! 💪' : 'Keep practicing! 📚'}
                </p>
                <button onClick={handleFinish} className="px-6 py-2.5 rounded-xl bg-adiptify-gold text-white font-medium hover:bg-amber-500 transition-colors shadow-md">
                    Continue to Application →
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Progress */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Question {currentQ + 1} of {questions.length}</span>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div key={i} className={`w-6 h-1.5 rounded-full transition-colors ${answers[i] !== undefined ? (answers[i] === questions[i].correctAnswer ? 'bg-emerald-400' : 'bg-red-400') : i === currentQ ? 'bg-adiptify-gold' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                </div>
            </div>

            {/* Question */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">{q.question}</h3>
                <div className="space-y-2.5">
                    {q.options.map((opt, i) => {
                        const isSelected = selected === i;
                        const isRight = i === q.correctAnswer;
                        const answered = selected !== undefined;
                        let style = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500';
                        if (answered && isRight) style = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300';
                        else if (answered && isSelected && !isRight) style = 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300';
                        return (
                            <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all duration-200 ${style}`}>
                                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation shown after answering */}
                {selected !== undefined && q.explanation && (
                    <div className="mt-4 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/40 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                    </div>
                )}
            </div>

            {/* Hint + Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => { setShowHint(!showHint); if (!showHint) setHintsUsed(h => h + 1); }} className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                    <Lightbulb size={14} /> {showHint ? 'Hide hint' : 'Show hint'}
                </button>
                <div className="flex gap-2">
                    {currentQ > 0 && (
                        <button onClick={() => { setCurrentQ(c => c - 1); setShowHint(false); }} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Back</button>
                    )}
                    {currentQ < questions.length - 1 ? (
                        <button onClick={() => { setCurrentQ(c => c + 1); setShowHint(false); }} disabled={selected === undefined} className="px-4 py-2 rounded-xl bg-adiptify-navy dark:bg-slate-600 text-sm text-white hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">Next <ChevronRight size={14} /></button>
                    ) : (
                        <button onClick={() => setShowResult(true)} disabled={!allAnswered} className="px-4 py-2 rounded-xl bg-adiptify-gold text-sm text-white hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">See Results</button>
                    )}
                </div>
            </div>

            {showHint && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/40 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
                    <Lightbulb size={12} className="inline mr-1" /> Think about the core definition and how it relates to the answer choices.
                </div>
            )}
        </div>
    );
}

function ApplicationSection({ concept }) {
    const [completed, setCompleted] = useState(false);
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-500/10 dark:to-emerald-500/5 border border-emerald-200/40 dark:border-emerald-500/20">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3"><Rocket size={20} /> Application Task</h3>
                <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">{concept.pipeline?.applicationTask || 'No application task available.'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Evaluation Criteria</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{concept.pipeline?.evaluationCriteria || 'Complete the task above.'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/30 dark:border-amber-500/20">
                <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">This task should be completed in your local development environment. Mark it complete when you've finished.</p>
                </div>
            </div>
            <button onClick={() => setCompleted(!completed)} className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40' : 'bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}>
                {completed ? '✓ Marked Complete' : 'Mark as Complete'}
            </button>
        </div>
    );
}

function EvaluationSection({ concept, practiceResult }) {
    const accuracy = practiceResult ? (practiceResult.correct / practiceResult.total) : 0;
    const timeMinutes = practiceResult ? (practiceResult.timeTakenMs / 60000).toFixed(1) : 0;
    const hints = practiceResult?.hintUsage || 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50/50 dark:from-red-500/10 dark:to-orange-500/5 border border-red-200/40 dark:border-red-500/20">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-3"><CheckCircle2 size={20} /> Performance Evaluation</h3>
                <p className="text-sm text-red-900/80 dark:text-red-200/80">Your learning metrics for this concept.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Accuracy', value: `${Math.round(accuracy * 100)}%`, desc: 'Practice questions', color: accuracy >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
                    { label: 'Time Spent', value: `${timeMinutes} min`, desc: 'Practice session', color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Hints Used', value: hints, desc: 'During practice', color: hints <= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
                    { label: 'Mastery Est.', value: `${Math.round(accuracy * 80)}%`, desc: 'Composite score', color: 'text-purple-600 dark:text-purple-400' },
                ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                        <p className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{stat.desc}</p>
                    </div>
                ))}
            </div>

            {accuracy < 0.6 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/40 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    <div><span className="font-semibold">Recommendation:</span> Your mastery is below 60%. Consider reviewing the explanation and practicing again before moving on.</div>
                </div>
            )}

            {accuracy >= 0.8 && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/40 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Trophy size={14} className="mt-0.5 flex-shrink-0" />
                    <div><span className="font-semibold">Excellent!</span> You've demonstrated strong mastery. Advanced exercises are now available.</div>
                </div>
            )}
        </div>
    );
}

export default function ConceptLearning() {
    const { conceptId } = useParams();
    const navigate = useNavigate();
    const { getConceptById, submitPerformance } = useAdaptify();
    const [stage, setStage] = useState(0);
    const [practiceResult, setPracticeResult] = useState(null);

    const concept = getConceptById(conceptId);

    useEffect(() => {
        setStage(0);
        setPracticeResult(null);
    }, [conceptId]);

    if (!concept) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <div className="text-center">
                    <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Concept not found.</p>
                    <button onClick={() => navigate('/modules')} className="mt-4 px-4 py-2 rounded-xl bg-adiptify-navy dark:bg-slate-700 text-white text-sm">← Back to Modules</button>
                </div>
            </div>
        );
    }

    const handlePracticeComplete = async (result) => {
        setPracticeResult(result);
        await submitPerformance(conceptId, {
            correct: result.correct,
            total: result.total,
            timeTakenMs: result.timeTakenMs,
            hintUsage: result.hintUsage,
            pipelineStage: 2, // practice stage
        });
    };

    const handleStageClick = (i) => {
        // Allow only completed or current+1 stages
        if (i <= stage + 1) setStage(i);
    };

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {/* Top bar */}
            <div className="px-6 py-4 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-20">
                <button onClick={() => navigate('/modules')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-adiptify-navy dark:text-slate-100 truncate">{concept.title}</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">{concept.category} • Level {concept.difficulty_level}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} />
                    <span>Step {stage + 1} of 5</span>
                </div>
            </div>

            {/* Stepper */}
            <StepperBar currentStage={stage} onStageClick={handleStageClick} />

            {/* Content */}
            <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
                {stage === 0 && <ExplainSection concept={concept} />}
                {stage === 1 && <DemoSection concept={concept} />}
                {stage === 2 && <PracticeSection concept={concept} onComplete={handlePracticeComplete} />}
                {stage === 3 && <ApplicationSection concept={concept} />}
                {stage === 4 && <EvaluationSection concept={concept} practiceResult={practiceResult} />}

                {/* Next stage button */}
                {stage < 4 && (
                    <div className="mt-8 flex justify-end">
                        <button onClick={() => setStage(s => s + 1)} className="px-5 py-2.5 rounded-xl bg-adiptify-navy dark:bg-slate-700 text-white text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-md">
                            Continue to {STAGES[stage + 1]?.label} <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
