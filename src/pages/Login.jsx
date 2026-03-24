import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useQuiz } from '../context/QuizContext';
import { loginUser, registerUser } from '../api/client';
import { LogIn, UserPlus, Sun, Moon, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { resolvedTheme, toggleTheme } = useTheme();
    const { login } = useQuiz();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await loginUser(email.trim(), password);
            login(data.user);
            navigate('/quiz-dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('Name is required'); return; }
        setLoading(true);
        try {
            await registerUser({ name: name.trim(), email: email.trim(), password, studentId: studentId.trim() || undefined });
            // Auto-login after register
            const data = await loginUser(email.trim(), password);
            login(data.user);
            navigate('/quiz-dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 relative min-h-screen">
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white shadow-sm transition-colors"
                title={resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-transparent dark:border-slate-700">
                    {/* Accent gradient bar */}
                    <div className="h-1.5 bg-gradient-to-r from-adiptify-navy via-adiptify-olive to-adiptify-gold" />

                    <div className="p-8">
                        {/* Logo */}
                        <div className="text-center mb-7">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-2xl font-bold text-adiptify-navy">A</span>
                            </div>
                            <h1 className="text-2xl font-bold text-adiptify-navy dark:text-white">Adiptify</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Adaptive Learning Platform</p>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-6">
                            {['login', 'register'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTab(t); setError(''); }}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t
                                        ? 'bg-white dark:bg-slate-800 text-adiptify-navy dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                        }`}
                                >
                                    {t === 'login' ? 'Sign In' : 'Register'}
                                </button>
                            ))}
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2"
                                >
                                    <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Form */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {tab === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your full name"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder="e.g. 23BAI70412"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-adiptify-gold/50 focus:border-adiptify-gold transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                    {loading ? 'Creating account…' : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
