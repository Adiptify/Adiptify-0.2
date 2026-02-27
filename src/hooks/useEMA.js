import { useCallback } from 'react';

/**
 * Custom hook providing Exponential Moving Average logic and Smart Grading metrics
 */
export function useEMA(alpha = 0.3) {
    // alpha is the Weight. 0.3 means new scores account for 30%, past history 70%

    /**
     * Calculate new EMA mastery score
     * @param {number} currentScore The score of the most recent assessment (0-100)
     * @param {number} previousMastery The current EMA mastery score (0-100)
     * @returns {number} The updated mastery score, bounded 0-100
     */
    const calculateNewMastery = useCallback((currentScore, previousMastery) => {
        if (typeof previousMastery !== 'number') return currentScore;

        // EMA Formula: New_Mastery = (Current_Score * Weight) + (Previous_Mastery * (1 - Weight))
        const newMastery = (currentScore * alpha) + (previousMastery * (1 - alpha));

        // Ensure bounds and round to 1 decimal place
        return Math.min(100, Math.max(0, Math.round(newMastery * 10) / 10));
    }, [alpha]);

    /**
     * Determine the appropriate difficulty multiplier for the next question
     * @param {number} currentMastery The student's current mastery percentage
     * @returns {number} Difficulty scale from 0.6 to 1.4
     */
    const getDifficultyScale = useCallback((currentMastery) => {
        // Basic scaling logic:
        // If mastery is very low (<30), scale to 0.6 (easiest)
        // If mastery is very high (>90), scale to 1.4 (hardest)

        if (currentMastery < 30) return 0.6;
        if (currentMastery > 90) return 1.4;

        // Linear interpolation between 30 and 90, mapping to 0.7-1.3
        const normalized = (currentMastery - 30) / 60; // 0 to 1
        return parseFloat((0.7 + (normalized * 0.6)).toFixed(2));
    }, []);

    /**
     * Simple Levenshtein distance for fill-in-the-blanks fallback
     */
    const calculateLevenshteinSimilarity = useCallback((str1, str2) => {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();

        if (s1 === s2) return 1.0;
        if (s1.length === 0 || s2.length === 0) return 0.0;

        const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

        for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= s2.length; j++) {
            for (let i = 1; i <= s1.length; i++) {
                const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        const maxLen = Math.max(s1.length, s2.length);
        const distance = matrix[s2.length][s1.length];

        return 1 - (distance / maxLen);
    }, []);

    return {
        calculateNewMastery,
        getDifficultyScale,
        calculateLevenshteinSimilarity
    };
}
