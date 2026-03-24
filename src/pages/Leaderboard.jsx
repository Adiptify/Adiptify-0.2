import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
    const { leaderboard, user } = useQuiz();

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-adiptify-gold" size={28} />
                <h1 className="text-2xl font-bold text-adiptify-navy dark:text-white">Leaderboard</h1>
            </div>

            {leaderboard.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 p-12 text-center"
                >
                    <Medal className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                    <h2 className="text-lg font-semibold text-slate-500 dark:text-slate-400">No scores yet</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Complete a quiz to appear on the leaderboard!</p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">Rank</th>
                                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">Score</th>
                                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => {
                                const isCurrentUser = user && entry.name === user.name;
                                return (
                                    <tr
                                        key={index}
                                        className={`border-b border-slate-50 dark:border-slate-700/50 transition-colors ${isCurrentUser ? 'bg-adiptify-gold/5 dark:bg-adiptify-gold/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                                    >
                                        <td className="px-6 py-4">
                                            {index < 3 ? (
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                                                    index === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                                                        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-500 dark:text-slate-400 pl-2">{index + 1}</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isCurrentUser ? 'font-bold text-adiptify-navy dark:text-adiptify-gold' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {entry.name} {isCurrentUser && <span className="text-adiptify-gold ml-1">(You)</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-semibold ${entry.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : entry.score >= 50 ? 'text-adiptify-gold' : 'text-red-500 dark:text-red-400'}`}>
                                                {entry.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-400 dark:text-slate-500">
                                            {entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
};

export default Leaderboard;
