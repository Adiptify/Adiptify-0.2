import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addScore, quizzes } = useQuiz();

    const quiz = quizzes.find(q => String(q.id) === String(id));

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const answersRef = useRef(answers);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const handleFinish = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!quiz) return;
        const currentAnswers = answersRef.current;
        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (currentAnswers[idx] === q.correctAnswer) {
                score += (100 / quiz.questions.length);
            }
        });
        const finalScore = Math.round(score);
        addScore(finalScore);
        navigate('/result', { state: { score: finalScore, quizId: quiz.id, answers: currentAnswers } });
    }, [quiz, addScore, navigate]);

    useEffect(() => {
        if (quiz) {
            setCurrentQuestionIndex(0);
            setAnswers({});
            answersRef.current = {};
            setTimeLeft(quiz.duration * 60);

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id, quiz]);

    useEffect(() => {
        if (timeLeft === 0 && quiz && timerRef.current === null) {
            // Timer just expired
        }
    }, [timeLeft]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    if (!quiz) return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center max-w-md">
                <AlertTriangle className="mx-auto mb-3 text-red-500" size={40} />
                <h2 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Quiz Not Found</h2>
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">This quiz session was not found or has expired.</p>
                <button
                    onClick={() => navigate('/quiz-dashboard')}
                    className="px-6 py-2.5 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const isLowTime = timeLeft < 60;

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-bold text-adiptify-navy dark:text-white">{quiz.title}</h1>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${isLowTime ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}>
                    <Clock size={16} />
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-adiptify-gold to-adiptify-terracotta rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-6 mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">
                            {currentQuestion.question}
                        </h2>
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = answers[currentQuestionIndex] === idx;
                                return (
                                    <label
                                        key={idx}
                                        className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected
                                            ? 'border-adiptify-gold bg-adiptify-gold/5 dark:bg-adiptify-gold/10 shadow-sm'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionIndex}`}
                                            value={idx}
                                            checked={isSelected}
                                            onChange={() => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }))}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                            ? 'border-adiptify-gold bg-adiptify-gold'
                                            : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {option}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-lg active:scale-[0.98]"
                    >
                        <CheckCircle size={16} />
                        Finish Quiz
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 font-semibold text-sm hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all active:scale-[0.98]"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;
