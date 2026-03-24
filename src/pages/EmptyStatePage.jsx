import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export default function EmptyStatePage() {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative p-8 h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
                <ArrowLeft size={16} />
                Go Back
            </button>

            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
                    <Construction className="w-10 h-10 text-adiptify-gold" />
                </div>
                <h2 className="text-2xl font-bold text-adiptify-navy dark:text-white mb-3">Under Construction</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    This feature is currently being developed. Check back later for updates as we continue to improve your learning experience!
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex justify-center items-center px-6 py-3 bg-adiptify-navy dark:bg-adiptify-gold text-white dark:text-adiptify-navy font-bold rounded-xl hover:bg-adiptify-navy/90 dark:hover:bg-adiptify-gold/90 transition-colors shadow-md w-full"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
