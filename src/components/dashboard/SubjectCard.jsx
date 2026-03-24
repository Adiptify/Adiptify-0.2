import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

export default function SubjectCard({ subject, onClick, isActive }) {
    const isPositive = subject.trend.startsWith('+');

    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300
        ${isActive
                    ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-adiptify-navy dark:ring-adiptify-gold scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1'
                }
      `}
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-adiptify-navy dark:text-white">
                        {subject.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adaptive mastery score</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-700 border ${isActive ? 'border-adiptify-navy/20 dark:border-adiptify-gold/20' : 'border-slate-100 dark:border-slate-600'}`}>
                    <span className="text-2xl font-black text-adiptify-navy dark:text-adiptify-gold">{subject.mastery}%</span>
                </div>
            </div>

            {/* SVG Mountain Graph Mockup */}
            <div className="h-24 w-full bg-slate-50/50 dark:bg-slate-700/50 rounded-xl mb-6 relative overflow-hidden border border-slate-100 dark:border-slate-600 flex items-end">
                <svg
                    viewBox="0 0 100 40"
                    className="w-full h-full preserve-3d"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id={`grad-${subject.id}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#94A378" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#94A378" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id={`grad-active-${subject.id}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2D3C59" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#2D3C59" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        className="mountain-graph-path"
                        d={`M0 40 L10 35 L25 38 L40 20 L55 25 L75 10 L100 ${40 - (subject.mastery * 0.4)} L100 40 Z`}
                        fill={`url(#${isActive ? `grad-active-${subject.id}` : `grad-${subject.id}`})`}
                    />
                    <polyline
                        className="mountain-graph-path transition-all duration-500 ease-out"
                        points={`0 40, 10 35, 25 38, 40 20, 55 25, 75 10, 100 ${40 - (subject.mastery * 0.4)}`}
                        fill="none"
                        stroke={isActive ? '#2D3C59' : '#94A378'}
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Weekly Trend</p>
                    <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-adiptify-olive' : 'text-adiptify-terracotta'}`}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{subject.trend}</span>
                    </div>
                </div>

                <div className={`
          flex items-center gap-1 text-sm font-medium transition-colors
          ${isActive ? 'text-adiptify-navy dark:text-adiptify-gold' : 'text-slate-400 group-hover:text-adiptify-navy dark:group-hover:text-adiptify-gold'}
        `}>
                    <span>Deep Dive</span>
                    <ChevronRight size={16} className={`transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                </div>
            </div>
        </div>
    );
}
