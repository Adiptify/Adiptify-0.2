import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useQuiz();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
