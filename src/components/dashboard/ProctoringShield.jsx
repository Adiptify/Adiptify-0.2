import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProctoringShield() {
    const [violations, setViolations] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsFocused(false);
                setViolations(prev => {
                    const newCount = prev + 1;
                    // In a real app, send strict violation log to Backend/Instructor Console here
                    console.warn(`[Proctoring] Focus lost. Violation log recorded. Count: ${newCount}`);
                    return newCount;
                });
                setShowWarning(true);
            } else {
                setIsFocused(true);
                // Auto-hide warning after 5 seconds of return
                setTimeout(() => setShowWarning(false), 5000);
            }
        };

        const handleBlur = () => {
            // Fallback for window blur events if visibilityState isn't enough
            if (isFocused) handleVisibilityChange();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [isFocused]);

    return (
        <>
            {/* Persistent Status Indicator */}
            <div className="fixed top-4 right-4 z-40">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm border backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-colors ${violations > 0
                        ? 'bg-adiptify-gold/10 border-adiptify-gold/20 text-adiptify-gold'
                        : 'bg-adiptify-olive/10 border-adiptify-olive/20 text-adiptify-olive'
                    }`}>
                    {violations > 0 ? (
                        <>
                            <ShieldAlert size={14} className="animate-pulse" />
                            <span>Proctoring: {violations} Violations</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={14} />
                            <span>Proctoring Active</span>
                        </>
                    )}
                </div>
            </div>

            {/* Screen Warning Overlay */}
            <AnimatePresence>
                {(!isFocused || showWarning) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-colors duration-500 ${!isFocused ? 'bg-adiptify-navy/90 backdrop-blur-sm' : 'bg-transparent'
                            }`}
                    >
                        {!isFocused ? (
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                                <ShieldAlert size={48} className="text-adiptify-terracotta mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-adiptify-navy mb-2">Focus Lost</h2>
                                <p className="text-slate-600 mb-6">
                                    You have navigated away from the learning session. This event has been logged to the proctoring engine. Return to the tab to resume.
                                </p>
                                <div className="animate-pulse text-sm font-bold text-adiptify-terracotta uppercase tracking-wider">
                                    Waiting for return...
                                </div>
                            </div>
                        ) : (
                            <div className="absolute top-16 right-4 bg-white border border-adiptify-gold rounded-xl p-4 shadow-xl max-w-xs pointer-events-auto">
                                <p className="text-sm font-medium text-slate-800">
                                    <span className="font-bold text-adiptify-gold block mb-1">Warning Recorded</span>
                                    Please keep the Adiptify dashboard active during assessments.
                                </p>
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="mt-3 text-xs w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors font-semibold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
