import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);

    // Fetch enrolled subjects from backend
    useEffect(() => {
        const fetchEnrolled = async () => {
            try {
                const subjects = await apiFetch('/api/subjects/enrolled');
                setEnrolledSubjects(subjects);
            } catch (e) { /* ignore — offline mode */ }
        };
        fetchEnrolled();
    }, []);

    const [categories, setCategories] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('adiptify_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    // Fetch initial quizzes from Backend
    const fetchQuizzes = useCallback(async () => {
        try {
            const data = await apiFetch('/api/ai/generated');
            // Map backend generated assessments to frontend quiz shape
            const formattedQuizzes = data.map(assessment => {
                return {
                    id: assessment._id,
                    title: assessment.title || assessment.topic,
                    description: `AI Generated Quiz on ${assessment.topic}`,
                    duration: assessment.items.length * 2, // 2 mins per question average
                    questions: assessment.items.map((item, idx) => {
                        let correctIndex = 0;
                        if (typeof item.answer === 'number') {
                            correctIndex = item.answer;
                        } else if (typeof item.answer === 'string') {
                            correctIndex = item.choices.indexOf(item.answer);
                            if (correctIndex === -1) correctIndex = 0;
                        }
                        return {
                            id: item._id || idx,
                            question: item.question,
                            options: item.choices || [],
                            correctAnswer: correctIndex
                        };
                    })
                };
            });
            setQuizzes(formattedQuizzes);
        } catch (e) {
            console.error('Failed to load quizzes', e);
        }
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const data = await apiFetch('/api/assessment/leaderboard');
            setLeaderboard(data || []);
        } catch (e) {
            console.error('Failed to load leaderboard', e);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            // Note: If no categories endpoint exists, we can extract unique categories from subjects
            const subjectsContent = await apiFetch('/api/subjects');
            if (subjectsContent) {
                const uniqueCategories = new Set();
                const processedCategories = [];
                subjectsContent.forEach(sub => {
                    const catName = sub.category?.name || sub.category || "General";
                    if (!uniqueCategories.has(catName)) {
                        uniqueCategories.add(catName);
                        processedCategories.push({ _id: catName, name: catName });
                    }
                });
                setCategories(processedCategories);
            }
        } catch (e) {
            console.error('Failed to load categories', e);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchQuizzes();
            fetchLeaderboard();
            fetchCategories();
        }
    }, [user, fetchQuizzes, fetchLeaderboard, fetchCategories]);

    // Filter quizzes based on enrolled subjects' topics
    const filteredQuizzes = React.useMemo(() => {
        if (enrolledSubjects.length === 0) return quizzes; // show all if no enrollment data

        // Build a set of enrolled topic keywords for matching
        const enrolledTopics = new Set();
        enrolledSubjects.forEach(sub => {
            (sub.topics || []).forEach(t => enrolledTopics.add(t.toLowerCase()));
            // Also add the subject name as a keyword
            enrolledTopics.add(sub.name.toLowerCase());
            enrolledTopics.add(sub.slug?.toLowerCase());
        });

        return quizzes.filter(quiz => {
            const titleLower = quiz.title.toLowerCase();
            // Check if any enrolled topic/name appears in quiz title
            for (const topic of enrolledTopics) {
                if (topic && (titleLower.includes(topic.replace(/_/g, ' ')) ||
                    titleLower.includes(topic.replace(/-/g, ' ')))) {
                    return true;
                }
            }
            // Broad keyword matching for common quiz titles
            const keywords = {
                'javascript': ['web-development', 'javascript_fundamentals'],
                'react': ['web-development', 'react_basics'],
                'python': ['python-programming', 'python_basics'],
                'data structures': ['data-structures-algorithms', 'arrays_strings'],
                'web development': ['web-development', 'html_css'],
            };
            for (const [keyword, slugs] of Object.entries(keywords)) {
                if (titleLower.includes(keyword)) {
                    return slugs.some(s => enrolledTopics.has(s));
                }
            }
            return false;
        });
    }, [quizzes, enrolledSubjects]);

    const addQuiz = (newQuiz) => {
        fetchQuizzes(); // simply refetch from backend after a new one is saved
    };

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adiptify_user');
        localStorage.removeItem('adiptify_token');
    };

    const addScore = async (score, quizId = null, answers = {}) => {
        if (user) {
            try {
                await apiFetch('/api/assessment/simple-finish', {
                    method: 'POST',
                    body: { score, quizId, answers }
                });
                fetchLeaderboard();
            } catch (e) {
                console.error("Failed to save score", e);
            }
        }
    };

    const refreshSubjects = useCallback(async () => {
        try {
            const subjects = await apiFetch('/api/subjects/enrolled');
            setEnrolledSubjects(subjects);
        } catch (e) { /* ignore */ }
    }, []);

    return (
        <QuizContext.Provider value={{
            user, login, logout,
            leaderboard, addScore,
            quizzes: filteredQuizzes,
            allQuizzes: quizzes,
            addQuiz,
            enrolledSubjects, refreshSubjects,
            fetchQuizzes,
            categories,
        }}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuiz = () => useContext(QuizContext);
