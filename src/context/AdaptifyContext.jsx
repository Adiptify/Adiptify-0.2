import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdaptifyContext = createContext();

const API_BASE = 'http://localhost:4000/api';

// Fallback mock concepts for offline/no-backend mode
const MOCK_CONCEPTS = [
    { conceptId: 'linear_regression', title: 'Linear Regression', category: 'Machine Learning', difficulty_level: 2, description: 'Model relationships using a linear function.', prerequisites: [], pipeline: { explanation: 'Linear regression fits y = mx + b to minimize squared residuals.', demonstration: 'Drag data points to see the best-fit line adjust.', practiceQuestions: [{ question: 'What does the slope represent?', options: ['The y-intercept', 'Rate of change of y per unit x', 'The R² value', 'The error term'], correctAnswer: 1 }, { question: 'Which metric measures goodness-of-fit?', options: ['Accuracy', 'R²', 'F1-score', 'Cross-entropy'], correctAnswer: 1 }, { question: 'What assumption does OLS require about residuals?', options: ['Must be positive', 'Normally distributed with constant variance', 'Must equal zero', 'Must increase with x'], correctAnswer: 1 }], applicationTask: 'Train a linear regression model on housing data.', evaluationCriteria: 'R² > 0.6 and interpret coefficients.' } },
    { conceptId: 'logistic_regression', title: 'Logistic Regression', category: 'Machine Learning', difficulty_level: 3, description: 'Binary classification using the sigmoid function.', prerequisites: ['linear_regression'], pipeline: { explanation: 'Logistic regression uses σ(z) = 1/(1+e^(-z)) to produce probabilities.', demonstration: 'Visualize the sigmoid curve and adjust weights.', practiceQuestions: [{ question: 'Range of the sigmoid function?', options: ['(-∞, ∞)', '[-1, 1]', '(0, 1)', '[0, ∞)'], correctAnswer: 2 }, { question: 'Loss function for logistic regression?', options: ['MSE', 'Binary cross-entropy', 'Hinge loss', 'Huber loss'], correctAnswer: 1 }, { question: 'What happens when threshold is lowered from 0.5 to 0.3?', options: ['Fewer positives', 'More positives (higher recall)', 'No change', 'Model retrains'], correctAnswer: 1 }], applicationTask: 'Build a spam classifier.', evaluationCriteria: 'ROC-AUC > 0.75.' } },
    { conceptId: 'gradient_descent', title: 'Gradient Descent', category: 'Machine Learning', difficulty_level: 3, description: 'Iterative optimization via steepest descent.', prerequisites: ['linear_regression'], pipeline: { explanation: 'θ = θ - α·∇J(θ). Learning rate controls step size.', demonstration: 'Interactive 3D loss surface with optimization path.', practiceQuestions: [{ question: 'What happens if learning rate is too large?', options: ['Slow convergence', 'May overshoot and diverge', 'Faster always', 'No effect'], correctAnswer: 1 }, { question: 'Key difference between SGD and batch?', options: ['SGD uses all data', 'SGD uses one point per update', 'Batch uses one point', 'No difference'], correctAnswer: 1 }, { question: 'When to stop gradient descent?', options: ['After 100 iterations', 'When gradient ≈ 0', 'When loss increases', 'After one epoch'], correctAnswer: 1 }], applicationTask: 'Implement GD from scratch for a linear model.', evaluationCriteria: 'Correct update rule and convergence analysis.' } },
    { conceptId: 'decision_trees', title: 'Decision Trees', category: 'Machine Learning', difficulty_level: 2, description: 'Split-based predictions using decision rules.', prerequisites: [], pipeline: { explanation: 'Trees recursively split data maximizing information gain.', demonstration: 'Build a tree step-by-step and see partitions.', practiceQuestions: [{ question: 'Best split metric?', options: ['R² score', 'Information gain / Gini', 'Cross-entropy', 'MAE'], correctAnswer: 1 }, { question: 'What is overfitting in trees?', options: ['Underfitting', 'Memorizing training data', 'Too few features', 'High bias'], correctAnswer: 1 }, { question: 'How does pruning help?', options: ['Makes deeper', 'Removes low-value branches', 'Adds features', 'Changes criterion'], correctAnswer: 1 }], applicationTask: 'Train a decision tree on Iris data.', evaluationCriteria: 'Compare pruned vs unpruned trees.' } },
    { conceptId: 'neural_networks_basics', title: 'Neural Networks Fundamentals', category: 'Deep Learning', difficulty_level: 3, description: 'Neurons, layers, activations, and forward propagation.', prerequisites: ['gradient_descent'], pipeline: { explanation: 'Layers of neurons with weighted sums and activation functions.', demonstration: 'Build a network and watch data flow.', practiceQuestions: [{ question: 'What does activation function do?', options: ['Normalizes weights', 'Introduces non-linearity', 'Updates learning rate', 'Computes loss'], correctAnswer: 1 }, { question: 'Purpose of bias?', options: ['Speeds training', 'Shifts activation function', 'Prevents overfitting', 'Reduces dimensions'], correctAnswer: 1 }, { question: 'Parameters in 10-input, 5-neuron layer?', options: ['50', '55', '15', '10'], correctAnswer: 1 }], applicationTask: 'Build a 2-layer network for XOR.', evaluationCriteria: 'Classifies XOR and explains why single perceptron fails.' } },
    { conceptId: 'clustering_kmeans', title: 'K-Means Clustering', category: 'Machine Learning', difficulty_level: 2, description: 'Partition data into K clusters by minimizing within-cluster variance.', prerequisites: [], pipeline: { explanation: 'Initialize K centroids, assign points, update centroids, repeat.', demonstration: 'Watch K-Means iterate with moving centroids.', practiceQuestions: [{ question: 'What does K represent?', options: ['Features', 'Clusters', 'Iterations', 'Data points'], correctAnswer: 1 }, { question: 'How are points assigned?', options: ['Random', 'Nearest centroid', 'Class label', 'Alphabetical'], correctAnswer: 1 }, { question: 'What is the elbow method?', options: ['Regularization', 'Plotting inertia vs K', 'Dimensionality reduction', 'Activation function'], correctAnswer: 1 }], applicationTask: 'Apply K-Means to customer data.', evaluationCriteria: 'Identify elbow point and describe segments.' } },
    { conceptId: 'nlp_tokenization', title: 'NLP Tokenization', category: 'Natural Language Processing', difficulty_level: 2, description: 'Breaking text into meaningful token units.', prerequisites: [], pipeline: { explanation: 'Tokenization splits text into words, subwords, or characters.', demonstration: 'Compare different tokenization methods on sample text.', practiceQuestions: [{ question: 'Why prefer subword tokenization?', options: ['Faster', 'Handles unknown words', 'Fewer tokens', 'Simpler'], correctAnswer: 1 }, { question: 'What problem does tokenization solve?', options: ['Image classification', 'Text to numerical form', 'Database optimization', 'Audio processing'], correctAnswer: 1 }, { question: 'What is a token?', options: ['A word only', 'Meaningful text unit', 'A sentence', 'A document'], correctAnswer: 1 }], applicationTask: 'Implement whitespace and BPE tokenizers.', evaluationCriteria: 'Both produce correct output with trade-off discussion.' } },
    { conceptId: 'sentiment_analysis', title: 'Sentiment Analysis', category: 'Natural Language Processing', difficulty_level: 3, description: 'Classify text sentiment as positive or negative.', prerequisites: ['nlp_tokenization', 'logistic_regression'], pipeline: { explanation: 'Preprocess text, extract features (TF-IDF), classify.', demonstration: 'Enter reviews and see sentiment scores.', practiceQuestions: [{ question: 'What is TF-IDF?', options: ['Neural net', 'Term frequency × inverse document frequency', 'Tokenization', 'Clustering'], correctAnswer: 1 }, { question: 'Which baseline for sentiment?', options: ['K-Means', 'Naive Bayes', 'Linear Regression', 'PCA'], correctAnswer: 1 }, { question: 'Why is negation handling important?', options: ['Speed improvement', "'not good' should be negative", 'Reduces vocab', 'Not important'], correctAnswer: 1 }], applicationTask: 'Build sentiment classifier with TF-IDF + logistic regression.', evaluationCriteria: 'F1 > 0.7 with confusion matrix.' } },
    { conceptId: 'data_preprocessing', title: 'Data Preprocessing', category: 'Data Analytics', difficulty_level: 1, description: 'Clean and structure raw data for modeling.', prerequisites: [], pipeline: { explanation: 'Handle missing values, encode categoricals, scale numerics, detect outliers.', demonstration: 'Apply preprocessing steps to messy data interactively.', practiceQuestions: [{ question: 'Why is feature scaling important?', options: ['Makes data smaller', 'Algorithms sensitive to magnitudes', 'Cosmetic', 'Removes outliers'], correctAnswer: 1 }, { question: 'What is one-hot encoding?', options: ['Float to int', 'Binary columns per category', 'Hashing', 'Removing categoricals'], correctAnswer: 1 }, { question: 'How to handle missing values?', options: ['Always delete', 'Choose imputation or deletion', 'Always fill 0', 'Ignore'], correctAnswer: 1 }], applicationTask: 'Clean a real-world dataset end-to-end.', evaluationCriteria: 'No missing values, model-ready, decisions justified.' } },
    { conceptId: 'eda', title: 'Exploratory Data Analysis', category: 'Data Analytics', difficulty_level: 1, description: 'Use statistics and visualizations to understand data.', prerequisites: [], pipeline: { explanation: 'Compute statistics, examine distributions, explore relationships.', demonstration: 'Auto EDA with stats, distribution plots, correlation heatmap.', practiceQuestions: [{ question: 'What does a box plot show?', options: ['Only the mean', 'Median, quartiles, outliers', 'Just range', 'Frequency'], correctAnswer: 1 }, { question: 'Correlation of -0.9 means?', options: ['Weak positive', 'Strong negative linear', 'No relationship', 'Quadratic'], correctAnswer: 1 }, { question: 'Why EDA before modeling?', options: ['Required by law', 'Understand data quality and patterns', 'Train model', 'Optional'], correctAnswer: 1 }], applicationTask: 'Complete EDA with 5+ visualizations.', evaluationCriteria: 'Properly labeled visualizations with insights.' } },
];

// Helper: get auth headers
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

export const AdaptifyProvider = ({ children }) => {
    const [concepts, setConcepts] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [dueReviews, setDueReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(false);
    const [enrolledCategories, setEnrolledCategories] = useState([]);

    // Fetch enrolled subjects to get their categories for filtering
    useEffect(() => {
        const fetchEnrolled = async () => {
            try {
                const res = await fetch(`${API_BASE}/subjects/enrolled`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const subjects = await res.json();
                    const categories = [...new Set(subjects.map(s => s.category))];
                    // Also add subject names as pseudo-categories for matching
                    const names = subjects.map(s => s.name);
                    setEnrolledCategories([...categories, ...names]);
                }
            } catch (e) { /* offline — show all */ }
        };
        fetchEnrolled();
    }, []);

    // Fetch concepts from backend or use mock (filtered by enrolled subjects)
    const fetchConcepts = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/adaptive/concepts`);
            if (res.ok) {
                const data = await res.json();
                if (data.concepts && data.concepts.length > 0) {
                    setConcepts(data.concepts);
                    setBackendAvailable(true);
                    return;
                }
            }
        } catch (e) { /* fallback to mock */ }

        // Filter mock concepts by enrolled categories (if any)
        if (enrolledCategories.length > 0) {
            const filtered = MOCK_CONCEPTS.filter(c =>
                enrolledCategories.some(cat =>
                    c.category.toLowerCase().includes(cat.toLowerCase()) ||
                    cat.toLowerCase().includes(c.category.toLowerCase())
                )
            );
            setConcepts(filtered.length > 0 ? filtered : MOCK_CONCEPTS);
        } else {
            setConcepts(MOCK_CONCEPTS);
        }
        setBackendAvailable(false);
    }, [enrolledCategories]);

    // Fetch due reviews
    const fetchDueReviews = useCallback(async () => {
        if (!backendAvailable) {
            // Mock: all concepts are "due" initially
            setDueReviews(concepts.map(c => ({
                conceptId: c.conceptId,
                concept: c,
                easiness_factor: 2.5,
                interval: 0,
                repetition: 0,
            })));
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/sr/due`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setDueReviews(data.due || []);
            }
        } catch (e) { /* ignore */ }
    }, [backendAvailable, concepts]);

    // Fetch analytics
    const fetchAnalytics = useCallback(async () => {
        if (!backendAvailable) {
            setAnalytics({
                overallMastery: 42,
                totalConcepts: MOCK_CONCEPTS.length,
                studiedConcepts: 4,
                completionRate: 30,
                retentionRate: 68,
                learningVelocity: 3,
                dueReviewCount: 5,
                masteryByCategory: [
                    { category: 'Machine Learning', mastery: 55 },
                    { category: 'Deep Learning', mastery: 30 },
                    { category: 'Data Analytics', mastery: 65 },
                    { category: 'Natural Language Processing', mastery: 25 },
                ],
                timePerTopic: MOCK_CONCEPTS.slice(0, 5).map(c => ({ title: c.title, timeSpent: Math.floor(Math.random() * 60) + 5 })),
                radarData: [
                    { axis: 'Machine Learning', value: 0.55 },
                    { axis: 'Deep Learning', value: 0.30 },
                    { axis: 'Data Analytics', value: 0.65 },
                    { axis: 'NLP', value: 0.25 },
                ],
                masteryHistory: [
                    { date: '2026-02-25', value: 20 },
                    { date: '2026-02-26', value: 28 },
                    { date: '2026-02-27', value: 35 },
                    { date: '2026-02-28', value: 38 },
                    { date: '2026-03-01', value: 42 },
                    { date: '2026-03-02', value: 45 },
                    { date: '2026-03-03', value: 42 },
                ],
            });
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (e) { /* ignore */ }
    }, [backendAvailable]);

    // Submit performance
    const submitPerformance = useCallback(async (conceptId, performanceData) => {
        if (!backendAvailable) {
            // Local progress tracking
            setUserProgress(prev => {
                const existing = prev[conceptId] || { mastery_score: 0, attempt_count: 0, pipeline_stage: 0 };
                const accuracy = performanceData.total > 0 ? performanceData.correct / performanceData.total : 0;
                const newMastery = Math.min(1, existing.mastery_score * 0.7 + accuracy * 0.3);
                return {
                    ...prev,
                    [conceptId]: {
                        ...existing,
                        mastery_score: Math.round(newMastery * 1000) / 1000,
                        attempt_count: existing.attempt_count + 1,
                        pipeline_stage: Math.max(existing.pipeline_stage, performanceData.pipelineStage || 0),
                        concept_accuracy: accuracy,
                    }
                };
            });
            return { ok: true, mastery_score: 0 };
        }
        try {
            const res = await fetch(`${API_BASE}/adaptive/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ conceptId, ...performanceData }),
            });
            if (res.ok) {
                const data = await res.json();
                setUserProgress(prev => ({ ...prev, [conceptId]: data }));
                return data;
            }
        } catch (e) { /* ignore */ }
        return { ok: false };
    }, [backendAvailable]);

    // Submit review
    const submitReview = useCallback(async (conceptId, quality) => {
        if (!backendAvailable) {
            setDueReviews(prev => prev.filter(r => r.conceptId !== conceptId));
            setUserProgress(prev => {
                const existing = prev[conceptId] || { mastery_score: 0, retention_score: 0 };
                return {
                    ...prev,
                    [conceptId]: {
                        ...existing,
                        retention_score: Math.min(1, (existing.retention_score || 0) + (quality >= 3 ? 0.15 : -0.05)),
                    }
                };
            });
            return { ok: true };
        }
        try {
            const res = await fetch(`${API_BASE}/sr/review`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ conceptId, quality }),
            });
            if (res.ok) {
                const data = await res.json();
                await fetchDueReviews();
                return data;
            }
        } catch (e) { /* ignore */ }
        return { ok: false };
    }, [backendAvailable, fetchDueReviews]);

    // Get concept by ID
    const getConceptById = useCallback((conceptId) => {
        return concepts.find(c => c.conceptId === conceptId) || null;
    }, [concepts]);

    // Initialize on mount
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchConcepts();
            setLoading(false);
        };
        init();
    }, [fetchConcepts]);

    // Fetch dependent data when backend status is known
    useEffect(() => {
        if (!loading) {
            fetchDueReviews();
            fetchAnalytics();
        }
    }, [loading, fetchDueReviews, fetchAnalytics]);

    return (
        <AdaptifyContext.Provider value={{
            concepts,
            userProgress,
            dueReviews,
            analytics,
            loading,
            backendAvailable,
            submitPerformance,
            submitReview,
            fetchDueReviews,
            fetchAnalytics,
            getConceptById,
        }}>
            {children}
        </AdaptifyContext.Provider>
    );
};

export const useAdaptify = () => useContext(AdaptifyContext);

export default AdaptifyContext;
