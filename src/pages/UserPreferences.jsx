import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, BookOpen, SlidersHorizontal, Bell, User, Check, Plus, Minus, Save, Loader2, ChevronDown } from 'lucide-react';

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

const SUBJECT_ICONS = {
    '🤖': 'bg-emerald-500',
    '🧠': 'bg-purple-500',
    '💬': 'bg-sky-500',
    '📊': 'bg-amber-500',
    '🌐': 'bg-blue-500',
    '🐍': 'bg-yellow-500',
    '🏗️': 'bg-indigo-500',
    '📐': 'bg-rose-500',
    '⚛️': 'bg-teal-500',
    '📚': 'bg-slate-500',
};

const COLOR_MAP = {
    emerald: 'bg-emerald-500 border-emerald-400',
    purple: 'bg-purple-500 border-purple-400',
    sky: 'bg-sky-500 border-sky-400',
    amber: 'bg-amber-500 border-amber-400',
    blue: 'bg-blue-500 border-blue-400',
    yellow: 'bg-yellow-500 border-yellow-400',
    indigo: 'bg-indigo-500 border-indigo-400',
    rose: 'bg-rose-500 border-rose-400',
    teal: 'bg-teal-500 border-teal-400',
};

const QUIZ_MODES = [
    { value: 'mixed', label: 'Mixed', desc: 'All question types' },
    { value: 'mcq', label: 'MCQ', desc: 'Multiple choice only' },
    { value: 'fill_blank', label: 'Fill in the Blank', desc: 'Type your answer' },
    { value: 'short_answer', label: 'Short Answer', desc: 'Free text responses' },
];

const DIFFICULTIES = [
    { value: 'adaptive', label: 'Adaptive', desc: 'AI adjusts difficulty' },
    { value: 'easy', label: 'Easy', desc: 'Beginner level' },
    { value: 'medium', label: 'Medium', desc: 'Intermediate level' },
    { value: 'hard', label: 'Hard', desc: 'Advanced problems' },
];

export default function UserPreferences() {
    const [allSubjects, setAllSubjects] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [preferences, setPreferences] = useState({
        quizMode: 'mixed',
        difficulty: 'adaptive',
        dailyGoal: 5,
        notifications: true,
    });
    const [themePreference, setThemePreference] = useState('system');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [activeSection, setActiveSection] = useState('subjects');

    // Fetch subjects & user data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all available subjects
                const subjectsRes = await fetch(`${API_BASE}/subjects`);
                if (subjectsRes.ok) {
                    const subjects = await subjectsRes.json();
                    setAllSubjects(subjects);
                }

                // Fetch user profile with enrolled subjects
                const userRes = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
                if (userRes.ok) {
                    const user = await userRes.json();
                    const enrolled = (user.enrolledSubjects || []).map(s => s._id || s);
                    setEnrolledIds(new Set(enrolled));

                    if (user.preferences) {
                        setPreferences(prev => ({ ...prev, ...user.preferences }));
                    }
                    if (user.themePreference) {
                        setThemePreference(user.themePreference);
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch settings data:', e);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Toggle subject enrollment
    const toggleSubject = useCallback(async (subjectId) => {
        try {
            const res = await fetch(`${API_BASE}/subjects/enroll/toggle`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ subjectId }),
            });
            if (res.ok) {
                const enrolled = await res.json();
                setEnrolledIds(new Set(enrolled.map(s => s._id)));
            }
        } catch (e) {
            console.warn('Failed to toggle enrollment:', e);
        }
    }, []);

    // Save preferences
    const savePreferences = useCallback(async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/auth/preferences`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...preferences, themePreference }),
            });
            if (res.ok) {
                setSaveMessage('Saved!');
                setTimeout(() => setSaveMessage(''), 2000);
            }
        } catch (e) {
            setSaveMessage('Failed to save');
        }
        setSaving(false);
    }, [preferences, themePreference]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-adiptify-gold" />
            </div>
        );
    }

    const sections = [
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'learning', label: 'Learning', icon: SlidersHorizontal },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="px-8 py-8 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-adiptify-navy dark:text-white tracking-tight flex items-center gap-3">
                            <Settings className="w-8 h-8 text-adiptify-gold" />
                            Settings
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Customize your learning experience.</p>
                    </div>
                    <button
                        onClick={savePreferences}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-adiptify-gold text-adiptify-navy font-semibold rounded-xl hover:bg-adiptify-gold/90 transition-all active:scale-[0.97] disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saveMessage || 'Save Changes'}
                    </button>
                </div>

                {/* Section tabs */}
                <div className="flex gap-1 mt-5 bg-slate-200/50 dark:bg-slate-800 rounded-xl p-1">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeSection === s.id
                                ? 'bg-white dark:bg-slate-700 text-adiptify-navy dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <s.icon size={16} />
                            {s.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {/* ═══ Subjects Section ═══ */}
                    {activeSection === 'subjects' && (
                        <motion.div
                            key="subjects"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Select the subjects you want to study. Your dashboard, quizzes, and analytics will adapt based on your selections.
                            </p>

                            {/* Group subjects by category */}
                            {Object.entries(
                                allSubjects.reduce((acc, s) => {
                                    if (!acc[s.category]) acc[s.category] = [];
                                    acc[s.category].push(s);
                                    return acc;
                                }, {})
                            ).map(([category, subjects]) => (
                                <div key={category} className="mb-8">
                                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {subjects.map(subject => {
                                            const isEnrolled = enrolledIds.has(subject._id);
                                            return (
                                                <motion.button
                                                    key={subject._id}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleSubject(subject._id)}
                                                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${isEnrolled
                                                        ? 'border-adiptify-gold bg-adiptify-gold/5 dark:bg-adiptify-gold/10 shadow-md'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                >
                                                    {/* Enrolled check */}
                                                    {isEnrolled && (
                                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-adiptify-gold flex items-center justify-center">
                                                            <Check size={14} className="text-white" />
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-3">
                                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${COLOR_MAP[subject.color] || 'bg-slate-500'
                                                            } bg-opacity-20`}>
                                                            {subject.icon}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-adiptify-navy dark:text-white">
                                                                {subject.name}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                                {subject.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                                                    {subject.topics?.length || 0} topics
                                                                </span>
                                                                {subject.isDefault && (
                                                                    <span className="text-[10px] font-medium text-adiptify-olive bg-adiptify-olive/10 px-2 py-0.5 rounded-full">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {allSubjects.length === 0 && (
                                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No subjects available. Run the seed script to add defaults.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══ Learning Preferences ═══ */}
                    {activeSection === 'learning' && (
                        <motion.div
                            key="learning"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Quiz Mode */}
                            <div>
                                <h3 className="text-lg font-bold text-adiptify-navy dark:text-white mb-1">Quiz Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose your preferred question format.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {QUIZ_MODES.map(mode => (
                                        <button
                                            key={mode.value}
                                            onClick={() => setPreferences(p => ({ ...p, quizMode: mode.value }))}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${preferences.quizMode === mode.value
                                                ? 'border-adiptify-gold bg-adiptify-gold/5 dark:bg-adiptify-gold/10'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-adiptify-navy dark:text-white text-sm">{mode.label}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{mode.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <h3 className="text-lg font-bold text-adiptify-navy dark:text-white mb-1">Difficulty</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Set your default difficulty level.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {DIFFICULTIES.map(d => (
                                        <button
                                            key={d.value}
                                            onClick={() => setPreferences(p => ({ ...p, difficulty: d.value }))}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${preferences.difficulty === d.value
                                                ? 'border-adiptify-gold bg-adiptify-gold/5 dark:bg-adiptify-gold/10'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-adiptify-navy dark:text-white text-sm">{d.label}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{d.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Daily Goal */}
                            <div>
                                <h3 className="text-lg font-bold text-adiptify-navy dark:text-white mb-1">Daily Goal</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    How many concepts do you want to study each day?
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, dailyGoal: Math.max(1, p.dailyGoal - 1) }))}
                                        className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center hover:border-adiptify-gold transition-colors"
                                    >
                                        <Minus size={16} className="text-slate-500" />
                                    </button>
                                    <div className="w-20 text-center">
                                        <span className="text-3xl font-bold text-adiptify-navy dark:text-white">{preferences.dailyGoal}</span>
                                        <p className="text-xs text-slate-400 mt-0.5">per day</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, dailyGoal: Math.min(50, p.dailyGoal + 1) }))}
                                        className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center hover:border-adiptify-gold transition-colors"
                                    >
                                        <Plus size={16} className="text-slate-500" />
                                    </button>
                                    {/* Slider */}
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={preferences.dailyGoal}
                                        onChange={(e) => setPreferences(p => ({ ...p, dailyGoal: parseInt(e.target.value) }))}
                                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-adiptify-gold"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ Notifications ═══ */}
                    {activeSection === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-adiptify-navy dark:text-white">Study Reminders</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Get reminded when you have concepts due for review.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, notifications: !p.notifications }))}
                                        className={`w-14 h-7 rounded-full transition-all duration-200 relative ${preferences.notifications ? 'bg-adiptify-gold' : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all duration-200 ${preferences.notifications ? 'left-8' : 'left-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    💡 Tip: Regular spaced reviews help you retain 80%+ of what you learn. We recommend keeping reminders on.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
