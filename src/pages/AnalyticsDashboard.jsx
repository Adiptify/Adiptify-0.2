import React, { useMemo } from 'react';
import { useAdaptify } from '../context/AdaptifyContext';
import { BarChart3, TrendingUp, Clock, Target, Zap, Brain, Activity, Gauge } from 'lucide-react';

// ─── SVG Mastery Progression Chart ───
function MasteryProgressionChart({ data }) {
    if (!data || data.length === 0) return <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No data yet</div>;

    const w = 480, h = 180, pad = 40;
    const plotW = w - pad * 2, plotH = h - pad * 2;
    const maxVal = Math.max(...data.map(d => d.value), 1);

    const points = data.map((d, i) => ({
        x: pad + (i / Math.max(data.length - 1, 1)) * plotW,
        y: pad + plotH - (d.value / maxVal) * plotH,
    }));

    const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${pad},${pad + plotH} ${linePoints} ${pad + plotW},${pad + plotH}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <g key={frac}>
                    <line x1={pad} y1={pad + plotH * (1 - frac)} x2={pad + plotW} y2={pad + plotH * (1 - frac)} stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-800" />
                    <text x={pad - 4} y={pad + plotH * (1 - frac) + 3} textAnchor="end" className="text-[8px] fill-slate-400 dark:fill-slate-500">{Math.round(maxVal * frac)}</text>
                </g>
            ))}
            {/* Area gradient */}
            <defs>
                <linearGradient id="masteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5BA41" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#E5BA41" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#masteryGrad)" />
            {/* Line */}
            <polyline fill="none" stroke="#E5BA41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={linePoints} />
            {/* Points */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" className="fill-white dark:fill-slate-800" stroke="#E5BA41" strokeWidth="2" />
            ))}
            {/* X-axis labels */}
            {data.map((d, i) => (
                <text key={i} x={points[i].x} y={h - 4} textAnchor="middle" className="text-[7px] fill-slate-400 dark:fill-slate-500">{d.date?.slice(5) || `D${i + 1}`}</text>
            ))}
        </svg>
    );
}

// ─── SVG Bar Chart ───
function BarChart({ data, valueKey = 'timeSpent', labelKey = 'title', maxBars = 8, color = '#94A378' }) {
    if (!data || data.length === 0) return <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No data yet</div>;

    const items = data.slice(0, maxBars);
    const maxVal = Math.max(...items.map(d => d[valueKey] || 0), 1);
    const barH = 24, gap = 6;
    const w = 480, pad = 120;
    const h = items.length * (barH + gap) + 20;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            {items.map((item, i) => {
                const barW = ((item[valueKey] || 0) / maxVal) * (w - pad - 20);
                const y = i * (barH + gap) + 10;
                return (
                    <g key={i}>
                        <text x={pad - 8} y={y + barH / 2 + 4} textAnchor="end" className="text-[9px] fill-slate-600 dark:fill-slate-400">{(item[labelKey] || '').slice(0, 18)}</text>
                        <rect x={pad} y={y} width={Math.max(barW, 2)} height={barH} rx="6" fill={color} opacity="0.7" />
                        <rect x={pad} y={y} width={Math.max(barW, 2)} height={barH} rx="6" fill={color} opacity="0.15" />
                        <text x={pad + barW + 5} y={y + barH / 2 + 4} className="text-[9px] fill-slate-500 dark:fill-slate-400 font-medium">{item[valueKey]}{valueKey === 'timeSpent' ? 'm' : '%'}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─── Radar Chart ───
function RadarChart({ data, size = 220 }) {
    if (!data || data.length === 0) return <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No data yet</div>;

    const cx = size / 2, cy = size / 2;
    const r = size / 2 - 30;
    const n = data.length;
    const angleStep = (2 * Math.PI) / n;

    // Grid rings
    const rings = [0.25, 0.5, 0.75, 1.0];

    // Data polygon
    const dataPoints = data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
            x: cx + Math.cos(angle) * r * d.value,
            y: cy + Math.sin(angle) * r * d.value,
        };
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full mx-auto" style={{ maxWidth: size }}>
            {/* Background rings */}
            {rings.map(ring => (
                <polygon key={ring} points={
                    Array.from({ length: n }).map((_, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        return `${cx + Math.cos(angle) * r * ring},${cy + Math.sin(angle) * r * ring}`;
                    }).join(' ')
                } fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-200 dark:text-slate-700" />
            ))}
            {/* Axis lines */}
            {data.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const ex = cx + Math.cos(angle) * r;
                const ey = cy + Math.sin(angle) * r;
                return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />;
            })}
            {/* Data area */}
            <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="#E5BA41" fillOpacity="0.15" stroke="#E5BA41" strokeWidth="2" />
            {/* Data points */}
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-white dark:fill-slate-800" stroke="#E5BA41" strokeWidth="2" />
            ))}
            {/* Labels */}
            {data.map((d, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const lx = cx + Math.cos(angle) * (r + 18);
                const ly = cy + Math.sin(angle) * (r + 18);
                return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-slate-600 dark:fill-slate-400 font-medium">{d.axis}</text>;
            })}
        </svg>
    );
}

// ─── Gauge Widget ───
function GaugeWidget({ value, label, icon: Icon, color = 'text-adiptify-gold', bgColor = 'bg-amber-50' }) {
    return (
        <div className={`p-5 rounded-2xl ${bgColor} border border-slate-200/30 dark:border-slate-700/30`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                {Icon && <Icon size={16} className={color} />}
            </div>
            <p className={`text-3xl font-black ${color}`}>{typeof value === 'number' ? (value > 1 ? value : `${Math.round(value * 100)}%`) : value}</p>
        </div>
    );
}

// ─── Retention Gauge (circular) ───
function RetentionGauge({ value, size = 140 }) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (value / 100) * circumference;
    const color = value >= 70 ? '#94A378' : value >= 40 ? '#E5BA41' : '#D1855C';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={progress} style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color }}>{value}%</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Retention</span>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───
export default function AnalyticsDashboard() {
    const { analytics, loading } = useAdaptify();

    const data = analytics || {
        overallMastery: 0,
        totalConcepts: 0,
        studiedConcepts: 0,
        completionRate: 0,
        retentionRate: 0,
        learningVelocity: 0,
        dueReviewCount: 0,
        masteryByCategory: [],
        timePerTopic: [],
        radarData: [],
        masteryHistory: [],
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-3 border-adiptify-gold border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header */}
            <header className="px-8 py-8 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <h2 className="text-3xl font-bold text-adiptify-navy dark:text-slate-100 tracking-tight flex items-center gap-3">
                    <BarChart3 className="text-adiptify-olive" size={28} />
                    Learning Analytics
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive metrics tracking your cognitive learning journey.</p>
            </header>

            <div className="p-8 space-y-6">
                {/* Top metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GaugeWidget value={data.overallMastery} label="Overall Mastery" icon={Brain} color="text-adiptify-gold" bgColor="bg-gradient-to-br from-amber-50 to-orange-50/30 dark:from-amber-500/10 dark:to-orange-500/5" />
                    <GaugeWidget value={`${data.studiedConcepts}/${data.totalConcepts}`} label="Concepts Studied" icon={Target} color="text-blue-600 dark:text-blue-400" bgColor="bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:from-blue-500/10 dark:to-indigo-500/5" />
                    <GaugeWidget value={data.completionRate} label="Completion Rate" icon={Activity} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-gradient-to-br from-emerald-50 to-teal-50/30 dark:from-emerald-500/10 dark:to-teal-500/5" />
                    <GaugeWidget value={data.learningVelocity} label="Velocity (weekly)" icon={Zap} color="text-purple-600 dark:text-purple-400" bgColor="bg-gradient-to-br from-purple-50 to-violet-50/30 dark:from-purple-500/10 dark:to-violet-500/5" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Mastery Progression */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><TrendingUp size={16} className="text-adiptify-gold" /> Mastery Progression</h3>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Over time</span>
                        </div>
                        <MasteryProgressionChart data={data.masteryHistory} />
                    </div>

                    {/* Retention Gauge */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><Gauge size={16} className="text-adiptify-olive" /> Retention Rate</h3>
                        <RetentionGauge value={data.retentionRate} />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">Based on spaced repetition recall quality</p>
                    </div>
                </div>

                {/* Charts row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Time per Topic */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><Clock size={16} className="text-blue-500" /> Time per Topic (mins)</h3>
                        <BarChart data={data.timePerTopic} valueKey="timeSpent" labelKey="title" color="#3b82f6" />
                    </div>

                    {/* Skill Radar */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><Target size={16} className="text-adiptify-terracotta" /> Skill Radar</h3>
                        <RadarChart data={data.radarData} />
                    </div>
                </div>

                {/* Category mastery breakdown */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5"><Brain size={16} className="text-purple-500" /> Mastery by Category</h3>
                    <div className="space-y-3">
                        {(data.masteryByCategory || []).map((cat, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-xs text-slate-600 dark:text-slate-400 w-40 truncate font-medium">{cat.category}</span>
                                <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-adiptify-gold to-adiptify-terracotta transition-all duration-700" style={{ width: `${cat.mastery}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{cat.mastery}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Due reviews notice */}
                {data.dueReviewCount > 0 && (
                    <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/40 dark:border-amber-500/20 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Clock size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">You have {data.dueReviewCount} concepts due for review</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400/70 mt-0.5">Head to Spaced Review to maintain your retention scores.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
