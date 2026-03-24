import React, { useState, useCallback, useMemo } from 'react';
import { FlaskConical, SlidersHorizontal, Play, RotateCcw, Layers, Activity, Target } from 'lucide-react';

// ─── Gradient Descent Simulator ───
function GradientDescentSim() {
    const [lr, setLr] = useState(0.05);
    const [iterations, setIterations] = useState(50);
    const [running, setRunning] = useState(false);

    // Simulate gradient descent on f(x) = x²
    const results = useMemo(() => {
        let x = 5.0;
        const points = [{ iter: 0, x, loss: x * x }];
        for (let i = 1; i <= iterations; i++) {
            const grad = 2 * x;
            x = x - lr * grad;
            points.push({ iter: i, x: Math.round(x * 10000) / 10000, loss: Math.round(x * x * 10000) / 10000 });
        }
        return points;
    }, [lr, iterations]);

    const maxLoss = Math.max(...results.map(r => r.loss), 1);
    const finalLoss = results[results.length - 1].loss;
    const converged = finalLoss < 0.01;
    const diverged = finalLoss > 1000 || isNaN(finalLoss) || !isFinite(finalLoss);

    // SVG chart
    const chartW = 500, chartH = 200, pad = 30;
    const plotW = chartW - pad * 2, plotH = chartH - pad * 2;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Learning Rate: <span className="text-adiptify-gold font-bold">{lr}</span></label>
                    <input type="range" min="0.001" max="1.2" step="0.001" value={lr} onChange={e => setLr(parseFloat(e.target.value))} className="w-full accent-adiptify-gold" />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500"><span>0.001</span><span>1.2</span></div>
                </div>
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Iterations: <span className="text-adiptify-gold font-bold">{iterations}</span></label>
                    <input type="range" min="5" max="200" step="5" value={iterations} onChange={e => setIterations(parseInt(e.target.value))} className="w-full accent-adiptify-gold" />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500"><span>5</span><span>200</span></div>
                </div>
            </div>

            {/* Loss curve chart */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Loss Curve — f(x) = x²</p>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 220 }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                        <g key={frac}>
                            <line x1={pad} y1={pad + plotH * frac} x2={pad + plotW} y2={pad + plotH * frac} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-700" />
                            <text x={pad - 4} y={pad + plotH * frac + 3} textAnchor="end" className="text-[8px] fill-slate-400 dark:fill-slate-500">{Math.round(maxLoss * (1 - frac) * 10) / 10}</text>
                        </g>
                    ))}
                    {/* Loss curve */}
                    {!diverged && (
                        <polyline
                            fill="none"
                            stroke="#E5BA41"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={results.map((r, i) => {
                                const x = pad + (i / iterations) * plotW;
                                const y = pad + plotH - (Math.min(r.loss, maxLoss) / maxLoss) * plotH;
                                return `${x},${y}`;
                            }).join(' ')}
                        />
                    )}
                    {/* Axis labels */}
                    <text x={chartW / 2} y={chartH - 4} textAnchor="middle" className="text-[9px] fill-slate-400 dark:fill-slate-500">Iterations</text>
                    <text x={8} y={chartH / 2} textAnchor="middle" className="text-[9px] fill-slate-400 dark:fill-slate-500" transform={`rotate(-90, 8, ${chartH / 2})`}>Loss</text>
                </svg>
            </div>

            {/* Status */}
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${converged ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-500/20' : diverged ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/40 dark:border-red-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-500/20'}`}>
                {converged ? '✓ Converged!' : diverged ? '⚠ Diverged — reduce learning rate' : '⏳ Still converging...'} | Final loss: {diverged ? '∞' : finalLoss.toFixed(4)}
            </div>
        </div>
    );
}

// ─── Neural Network Builder ───
function NeuralNetworkBuilder() {
    const [layers, setLayers] = useState([4, 8, 6, 3]);
    const [activation, setActivation] = useState('relu');
    const [learningRate, setLearningRate] = useState(0.01);

    const addLayer = () => setLayers(prev => [...prev.slice(0, -1), 4, prev[prev.length - 1]]);
    const removeLayer = () => { if (layers.length > 2) setLayers(prev => [...prev.slice(0, -2), prev[prev.length - 1]]); };
    const updateNeurons = (idx, val) => setLayers(prev => prev.map((n, i) => i === idx ? Math.max(1, Math.min(12, val)) : n));

    const totalParams = useMemo(() => {
        let params = 0;
        for (let i = 1; i < layers.length; i++) {
            params += layers[i - 1] * layers[i] + layers[i]; // weights + biases
        }
        return params;
    }, [layers]);

    // Network visualization
    const svgW = 460, svgH = 240;
    const layerSpacing = svgW / (layers.length + 1);
    const maxNeurons = Math.max(...layers);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Activation Function</label>
                    <select value={activation} onChange={e => setActivation(e.target.value)} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                        <option value="relu">ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="tanh">Tanh</option>
                        <option value="leaky_relu">Leaky ReLU</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Learning Rate: {learningRate}</label>
                    <input type="range" min="0.0001" max="0.1" step="0.0001" value={learningRate} onChange={e => setLearningRate(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                </div>
            </div>

            {/* Layer controls */}
            <div className="flex items-center gap-2 flex-wrap">
                {layers.map((n, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">{i === 0 ? 'Input' : i === layers.length - 1 ? 'Output' : `Hidden ${i}`}</span>
                        <input type="number" value={n} onChange={e => updateNeurons(i, parseInt(e.target.value) || 1)} className="w-12 text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-center" />
                    </div>
                ))}
                <div className="flex gap-1 ml-2">
                    <button onClick={addLayer} className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-bold hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors">+</button>
                    <button onClick={removeLayer} className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors">−</button>
                </div>
            </div>

            {/* Network visualization */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 260 }}>
                    {/* Connections */}
                    {layers.map((size, li) => {
                        if (li === 0) return null;
                        const prevSize = layers[li - 1];
                        return Array.from({ length: prevSize }).map((_, pi) =>
                            Array.from({ length: size }).map((_, ni) => {
                                const x1 = layerSpacing * li;
                                const y1 = (svgH / (prevSize + 1)) * (pi + 1);
                                const x2 = layerSpacing * (li + 1);
                                const y2 = (svgH / (size + 1)) * (ni + 1);
                                return <line key={`${li}-${pi}-${ni}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" opacity="0.6" className="text-slate-200 dark:text-slate-700" />;
                            })
                        );
                    })}
                    {/* Neurons */}
                    {layers.map((size, li) =>
                        Array.from({ length: size }).map((_, ni) => {
                            const cx = layerSpacing * (li + 1);
                            const cy = (svgH / (size + 1)) * (ni + 1);
                            const color = li === 0 ? '#3b82f6' : li === layers.length - 1 ? '#ef4444' : '#8b5cf6';
                            return <circle key={`n-${li}-${ni}`} cx={cx} cy={cy} r={Math.max(4, 14 - maxNeurons)} fill={color} opacity="0.7" />;
                        })
                    )}
                </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Layers</p><p className="text-lg font-bold text-purple-600 dark:text-purple-400">{layers.length}</p></div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Parameters</p><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalParams.toLocaleString()}</p></div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Activation</p><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 capitalize">{activation}</p></div>
            </div>
        </div>
    );
}

// ─── Classification Trainer ───
function ClassificationTrainer() {
    const [algorithm, setAlgorithm] = useState('logistic');
    const [dataSize, setDataSize] = useState(100);
    const [noise, setNoise] = useState(0.2);
    const [trained, setTrained] = useState(false);

    // Generate synthetic 2D data
    const data = useMemo(() => {
        const points = [];
        const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
        const rand = rng(42);
        for (let i = 0; i < dataSize; i++) {
            const cls = i < dataSize / 2 ? 0 : 1;
            const cx = cls === 0 ? 0.35 : 0.65;
            const cy = cls === 0 ? 0.35 : 0.65;
            const x = cx + (rand() - 0.5) * noise * 2;
            const y = cy + (rand() - 0.5) * noise * 2;
            points.push({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), cls });
        }
        return points;
    }, [dataSize, noise]);

    const accuracy = useMemo(() => {
        if (!trained) return 0;
        // Simulate accuracy based on noise and algorithm
        const base = { logistic: 0.88, svm: 0.92, tree: 0.85, knn: 0.87 }[algorithm] || 0.85;
        return Math.max(0.5, Math.min(0.99, base - noise * 0.3 + 0.02));
    }, [trained, algorithm, noise]);

    const svgSize = 300;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Algorithm</label>
                    <select value={algorithm} onChange={e => { setAlgorithm(e.target.value); setTrained(false); }} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                        <option value="logistic">Logistic Regression</option>
                        <option value="svm">SVM</option>
                        <option value="tree">Decision Tree</option>
                        <option value="knn">K-NN</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Data Size: {dataSize}</label>
                    <input type="range" min="20" max="300" step="10" value={dataSize} onChange={e => { setDataSize(parseInt(e.target.value)); setTrained(false); }} className="w-full accent-emerald-500" />
                </div>
                <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 block">Noise: {noise.toFixed(2)}</label>
                    <input type="range" min="0.05" max="0.8" step="0.05" value={noise} onChange={e => { setNoise(parseFloat(e.target.value)); setTrained(false); }} className="w-full accent-emerald-500" />
                </div>
            </div>

            {/* Scatter plot */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex justify-center">
                <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full" style={{ maxHeight: 300 }}>
                    <rect x="0" y="0" width={svgSize} height={svgSize} className="fill-slate-50 dark:fill-slate-900" rx="8" />
                    {/* Decision boundary (simple line for trained model) */}
                    {trained && (
                        <line x1="0" y1={svgSize} x2={svgSize} y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
                    )}
                    {/* Data points */}
                    {data.map((p, i) => (
                        <circle key={i} cx={p.x * svgSize} cy={(1 - p.y) * svgSize} r="4"
                            fill={p.cls === 0 ? '#3b82f6' : '#ef4444'} opacity="0.7"
                            stroke={p.cls === 0 ? '#1d4ed8' : '#b91c1c'} strokeWidth="0.5" />
                    ))}
                    {/* Axis labels */}
                    <text x={svgSize / 2} y={svgSize - 4} textAnchor="middle" className="text-[10px] fill-slate-400 dark:fill-slate-500">Feature 1</text>
                    <text x={8} y={svgSize / 2} textAnchor="middle" className="text-[10px] fill-slate-400 dark:fill-slate-500" transform={`rotate(-90, 8, ${svgSize / 2})`}>Feature 2</text>
                </svg>
            </div>

            {/* Train button + results */}
            <div className="flex items-center gap-4">
                <button onClick={() => setTrained(true)} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md">
                    <Play size={16} /> {trained ? 'Re-train' : 'Train Model'}
                </button>
                {trained && (
                    <div className="flex gap-3 animate-fadeIn">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/40 dark:border-emerald-500/20">
                            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">Accuracy</span>
                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{(accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/40 dark:border-blue-500/20">
                            <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Algorithm</span>
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 capitalize">{algorithm}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Experiment Lab ───
const EXPERIMENTS = [
    { id: 'gradient_descent', title: 'Gradient Descent Simulator', icon: Activity, desc: 'Explore how learning rate and iterations affect convergence.', color: 'from-amber-500 to-orange-500' },
    { id: 'neural_network', title: 'Neural Network Builder', icon: Layers, desc: 'Design network architectures and see parameter counts.', color: 'from-purple-500 to-indigo-500' },
    { id: 'classification', title: 'Classification Trainer', icon: Target, desc: 'Train classifiers on synthetic data with adjustable noise.', color: 'from-emerald-500 to-teal-500' },
];

export default function ExperimentLab() {
    const [active, setActive] = useState('gradient_descent');

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {/* Header */}
            <header className="px-8 py-8 backdrop-blur-sm bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <h2 className="text-3xl font-bold text-adiptify-navy dark:text-slate-100 tracking-tight flex items-center gap-3">
                    <FlaskConical className="text-adiptify-terracotta" size={28} />
                    Experiment Lab
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Interactive algorithm exploration through parameter manipulation.</p>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
                {/* Experiment selector */}
                <div className="lg:w-72 flex-shrink-0 space-y-3">
                    {EXPERIMENTS.map(exp => {
                        const Icon = exp.icon;
                        const isActive = active === exp.id;
                        return (
                            <button key={exp.id} onClick={() => setActive(exp.id)} className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${isActive ? 'bg-white dark:bg-slate-800 shadow-lg border-adiptify-gold/30 dark:border-adiptify-gold/40 ring-2 ring-adiptify-gold/10' : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center shadow-sm`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <h3 className={`text-sm font-semibold ${isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{exp.title}</h3>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-12">{exp.desc}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Active experiment */}
                <div className="flex-1 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <SlidersHorizontal size={16} className="text-slate-400 dark:text-slate-500" />
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{EXPERIMENTS.find(e => e.id === active)?.title}</h3>
                    </div>
                    {active === 'gradient_descent' && <GradientDescentSim />}
                    {active === 'neural_network' && <NeuralNetworkBuilder />}
                    {active === 'classification' && <ClassificationTrainer />}
                </div>
            </div>
        </div>
    );
}
