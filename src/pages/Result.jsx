import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, CheckCircle, XCircle } from 'lucide-react';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizzes } = useQuiz();
    const { score, quizId, answers } = location.state || { score: 0, quizId: null, answers: {} };

    const quiz = quizzes.find(q => String(q.id) === String(quizId));

    if (!quizId || !quiz) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">No session data found.</h2>
                <button
                    onClick={() => navigate('/quiz-dashboard')}
                    className="px-6 py-2.5 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const passed = score >= 50;

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-adiptify-navy dark:text-white text-center mb-6">Quiz Results</h1>

            {/* Score Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md mx-auto mb-8"
            >
                <div className={`rounded-2xl p-8 text-center shadow-lg ${passed ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'}`}>
                    <div className={`text-7xl font-black mb-3 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {score}%
                    </div>
                    <p className={`text-lg font-semibold ${passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                        {passed ? 'Great job! You passed.' : 'Keep practicing, you can do better!'}
                    </p>
                </div>
            </motion.div>

            {/* Answer Review */}
            <h2 className="text-lg font-bold text-adiptify-navy dark:text-white mb-4">Review Answers</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
                {quiz.questions.map((q, idx) => {
                    const isCorrect = answers[idx] === q.correctAnswer;
                    return (
                        <div key={q.id} className={`p-5 ${idx < quiz.questions.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                    {idx + 1}. {q.question}
                                </h3>
                                <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isCorrect
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                                    }`}>
                                    {isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Your Answer: <span className="font-medium text-slate-700 dark:text-slate-200">{q.options[answers[idx]] || 'None'}</span>
                            </p>
                            {!isCorrect && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                    Correct Answer: <span className="font-medium">{q.options[q.correctAnswer]}</span>
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/quiz-dashboard')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
                <Link
                    to="/leaderboard"
                    className="flex items-center gap-2 px-6 py-2.5 border border-adiptify-navy dark:border-adiptify-gold text-adiptify-navy dark:text-adiptify-gold rounded-xl font-semibold hover:bg-adiptify-navy/5 dark:hover:bg-adiptify-gold/10 transition-all"
                >
                    <Trophy size={16} />
                    View Leaderboard
                </Link>
            </div>
        </div>
    );
};

export default Result;
