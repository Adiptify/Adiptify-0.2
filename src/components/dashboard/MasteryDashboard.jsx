import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SubjectCard from './SubjectCard';
import DeepDivePanel from './DeepDivePanel';
import LearningRoom from '../chat/LearningRoom';
import ProctoringShield from './ProctoringShield';
import { Loader2, BookOpen, Play, Clock, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import AIQuizGenerator from '../quiz/AIQuizGenerator';

const subjectColors = [
    'from-adiptify-navy to-blue-800',
    'from-adiptify-olive to-green-700',
    'from-adiptify-terracotta to-orange-700',
    'from-adiptify-gold to-yellow-600',
    'from-indigo-600 to-purple-700',
    'from-rose-600 to-red-700',
    'from-teal-600 to-cyan-700',
];

const API_BASE = 'http://localhost:4000/api';

function getAuthHeaders() {
    try {
        const userData = localStorage.getItem('quiz_user');
        if (userData) {
            const user = JSON.parse(userData);
            return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` };
        }
    } catch (e) { /* ignore */ }
    return { 'Content-Type': 'application/json' };
}

// Color mapping from subject color names to the format SubjectCard expects
const COLOR_REMAP = {
    emerald: 'emerald',
    purple: 'violet',
    sky: 'sky',
    amber: 'amber',
    blue: 'blue',
    yellow: 'yellow',
    indigo: 'indigo',
    rose: 'rose',
    teal: 'teal',
};

// Fallback subjects when backend is not reachable and user has no enrolled subjects
const FALLBACK_SUBJECTS = [
    {
        id: 'placeholder',
        title: 'No Subjects Enrolled',
        mastery: 0,
        trend: '—',
        modules: { interest: 0, research: 0, practice: 0, goals: 0 },
        weakestModule: '—',
        color: 'slate',
        isEnrolled: false,
    },
];

export default function MasteryDashboard() {
    const navigate = useNavigate();
    const { user, leaderboard, quizzes } = useQuiz();

    const userStats = leaderboard.filter(entry => entry.name === user?.name);
    const bestScore = userStats.length > 0 ? Math.max(...userStats.map(s => s.score)) : 0;
    const attempts = userStats.length;

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isLearningRoomOpen, setIsLearningRoomOpen] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                // Try to get user's enrolled subjects
                const res = await fetch(`${API_BASE}/subjects/enrolled`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const enrolled = await res.json();
                    if (enrolled.length > 0) {
                        const mapped = enrolled.map(s => ({
                            id: s._id || s.slug,
                            title: s.name,
                            mastery: Math.floor(Math.random() * 60) + 30, // placeholder until real mastery is computed
                            trend: `+${Math.floor(Math.random() * 10)}%`,
                            modules: {
                                interest: Math.floor(Math.random() * 40) + 60,
                                research: Math.floor(Math.random() * 40) + 50,
                                practice: Math.floor(Math.random() * 40) + 40,
                                goals: Math.floor(Math.random() * 40) + 50,
                            },
                            weakestModule: s.topics?.[0] || 'General',
                            color: COLOR_REMAP[s.color] || 'emerald',
                            icon: s.icon,
                            isEnrolled: true,
                        }));
                        setSubjects(mapped);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                // Backend not available — try to show all subjects
            }

            // Fallback: fetch all subjects and show them
            try {
                const allRes = await fetch(`${API_BASE}/subjects`);
                if (allRes.ok) {
                    const all = await allRes.json();
                    if (all.length > 0) {
                        const mapped = all.filter(s => s.isDefault).map(s => ({
                            id: s._id || s.slug,
                            title: s.name,
                            mastery: Math.floor(Math.random() * 50) + 20,
                            trend: `+${Math.floor(Math.random() * 8)}%`,
                            modules: {
                                interest: Math.floor(Math.random() * 40) + 60,
                                research: Math.floor(Math.random() * 40) + 50,
                                practice: Math.floor(Math.random() * 40) + 40,
                                goals: Math.floor(Math.random() * 40) + 50,
                            },
                            weakestModule: s.topics?.[0] || 'General',
                            color: COLOR_REMAP[s.color] || 'emerald',
                            icon: s.icon,
                            isEnrolled: false,
                        }));
                        setSubjects(mapped);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            // Final fallback
            setSubjects(FALLBACK_SUBJECTS);
            setLoading(false);
        };

        fetchSubjects();
    }, []);

    const overallMastery = subjects.length > 0 && subjects[0].id !== 'placeholder'
        ? Math.round(subjects.reduce((sum, s) => sum + s.mastery, 0) / subjects.length)
        : 0;

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto relative bg-slate-50/50 dark:bg-slate-900/50">
            <ProctoringShield />

            <header className="px-8 py-8 md:py-10 flex justify-between items-end backdrop-blur-sm bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold text-adiptify-navy dark:text-white tracking-tight">Mastery Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your EMA-based adaptive learning progress.</p>
                </div>
                <div className="flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Mastery</p>
                        <p className="text-2xl font-bold text-adiptify-olive">{overallMastery}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-adiptify-olive/20 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <path
                                className="text-slate-200 dark:text-slate-700"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-adiptify-olive drop-shadow-sm"
                                strokeDasharray={`${overallMastery}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                    </div>
                </div>
            </header>

            <div className="p-8 flex-1">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-adiptify-gold" />
                    </div>
                ) : subjects[0]?.id === 'placeholder' ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">No Subjects Enrolled</h3>
                        <p className="text-slate-400 dark:text-slate-500 mb-4">Go to Settings to enroll in subjects you want to study.</p>
                        <a href="#/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-adiptify-gold text-adiptify-navy font-semibold rounded-xl hover:bg-adiptify-gold/90 transition-all">
                            Go to Settings
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map(subject => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                onClick={() => setSelectedSubject(subject)}
                                isActive={selectedSubject?.id === subject.id}
                            />
                        ))}
                    </div>
                )}

                {/* User Stats Banner */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-10 mb-6"
                >
                    <div className="bg-gradient-to-r from-adiptify-navy to-[#1e2d45] rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center text-3xl font-bold text-adiptify-navy shadow-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Quiz Performance</h2>
                                <p className="text-white/70 mt-1">Ready to test your knowledge today?</p>
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
                <h2 className="text-xl font-bold text-adiptify-navy dark:text-white mb-4 mt-8">Recommended Quizzes</h2>

                {quizzes.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <BookOpen className="w-14 h-14 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 mb-2">No quizzes found</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Generate one with AI above.</p>
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
                                className="group cursor-pointer"
                                onClick={() => navigate(`/quiz/${quiz.id}`)}
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

            {/* Slide-in Right Panel */}
            <DeepDivePanel
                subject={selectedSubject}
                onClose={() => setSelectedSubject(null)}
                onEnterLearningRoom={() => setIsLearningRoomOpen(true)}
            />

            {/* Learning Room Overlay Chat */}
            <LearningRoom
                subject={selectedSubject}
                isOpen={isLearningRoomOpen}
                onClose={() => setIsLearningRoomOpen(false)}
            />
        </div>
    );
}
