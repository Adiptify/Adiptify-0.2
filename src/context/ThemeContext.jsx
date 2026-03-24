import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuiz } from './QuizContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const STORAGE_KEY = 'adiptify_theme';

function getSystemTheme() {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
    const root = document.documentElement;
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export const ThemeProvider = ({ children }) => {
    const { user } = useQuiz();

    // Initialize theme: backend preference → localStorage → 'system'
    const [theme, setThemeState] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
        } catch (e) { /* ignore */ }
        return 'system';
    });

    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

    // Apply theme class to <html> on mount and on change
    useEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    // Listen for OS theme changes when in system mode
    useEffect(() => {
        if (theme !== 'system') return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme]);

    // Sync theme to backend when user is logged in
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch (e) { /* ignore */ }

        // If user is logged in, persist to backend
        if (user?.token) {
            fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ themePreference: newTheme }),
            }).catch(() => { /* silent fail — localStorage is the fallback */ });
        }
    }, [user]);

    // Load preference from backend when user logs in
    useEffect(() => {
        if (!user?.token) return;
        fetch('/api/user/preferences', {
            headers: { 'Authorization': `Bearer ${user.token}` },
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.themePreference && ['light', 'dark', 'system'].includes(data.themePreference)) {
                    setThemeState(data.themePreference);
                    localStorage.setItem(STORAGE_KEY, data.themePreference);
                }
            })
            .catch(() => { /* silent fail */ });
    }, [user?.token]);

    // Toggle function for the UI button (cycles: system → dark → light → system)
    const toggleTheme = useCallback(() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }, [resolvedTheme, setTheme]);

    const muiTheme = useMemo(() => createTheme({
        palette: {
            mode: resolvedTheme,
            primary: {
                main: '#2D3C59',
                ...(resolvedTheme === 'dark' && { main: '#E5BA41' }),
            },
            secondary: {
                main: '#94A378',
            },
            background: {
                default: resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc',
                paper: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
            }
        },
        typography: {
            fontFamily: "'Inter', 'Outfit', sans-serif"
        }
    }), [resolvedTheme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
