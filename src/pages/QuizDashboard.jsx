import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import AIQuizGenerator from '../components/quiz/AIQuizGenerator';
import { Play, Clock, HelpCircle, Trophy, Sparkles, BookOpen } from 'lucide-react';

const subjectColors = [
    'from-adiptify-navy to-blue-800',
    'from-adiptify-olive to-green-700',
    'from-adiptify-terracotta to-orange-700',
    'from-adiptify-gold to-yellow-600',
    'from-indigo-600 to-purple-700',
    'from-rose-600 to-red-700',
    'from-teal-600 to-cyan-700',
];

const QuizDashboard = () => {
    const navigate = useNavigate();
    const { user, leaderboard, quizzes } = useQuiz();

    const userStats = leaderboard.filter(entry => entry.name === user?.name);
    const bestScore = userStats.length > 0 ? Math.max(...userStats.map(s => s.score)) : 0;
    const attempts = userStats.length;

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            {/* User Stats Banner */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6"
            >
                <div className="bg-gradient-to-r from-adiptify-navy to-[#1e2d45] rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center text-3xl font-bold text-adiptify-navy shadow-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Hello, {user?.name || 'Student'}!</h2>
                            <p className="text-white/70 mt-1">Ready to sharpen your skills today?</p>
                            <div className="flex gap-3 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-sm">
                                    <Trophy size={14} className="text-adiptify-gold" />
                                    Best: {bestScore}%
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-sm">
                                    <Sparkles size={14} className="text-adiptify-olive" />
                                    Attempts: {attempts}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AI Quiz Generator */}
            <AIQuizGenerator />

            {/* Quiz Grid */}
            <h2 className="text-xl font-bold text-adiptify-navy dark:text-white mb-4 mt-6">Recommended Quizzes</h2>

            {quizzes.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <BookOpen className="w-14 h-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-2">No quizzes for your subjects</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Enroll in more subjects via Settings to see matching quizzes, or generate one with AI above.</p>
                    <a href="#/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-adiptify-gold text-adiptify-navy font-semibold rounded-xl hover:bg-adiptify-gold/90 transition-all text-sm">
                        Go to Settings
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {quizzes.map((quiz, index) => (
                        <motion.div
                            key={quiz.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -6 }}
                            className="group"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100 dark:border-slate-700">
                                {/* Colored header */}
                                <div className={`h-32 bg-gradient-to-br ${subjectColors[index % subjectColors.length]} relative`}>
                                    <span className="absolute bottom-2 right-4 text-6xl font-black text-white/10">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-adiptify-navy dark:text-white mb-1 group-hover:text-adiptify-terracotta transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
                                        {quiz.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-adiptify-olive border border-adiptify-olive/30 rounded-full px-2.5 py-1">
                                            <Clock size={12} />
                                            {quiz.duration} mins
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                            <HelpCircle size={12} />
                                            {quiz.questions.length} Questions
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all active:scale-[0.98]"
                                    >
                                        <Play size={16} />
                                        Start Examination
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizDashboard;
