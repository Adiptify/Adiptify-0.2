import React, { useState } from 'react';
import SubjectCard from './SubjectCard';
import DeepDivePanel from './DeepDivePanel';
import LearningRoom from '../chat/LearningRoom';
import ProctoringShield from './ProctoringShield';

// Mock Data for subjects
const mockSubjects = [
    {
        id: 'math',
        title: 'Advanced Calculus',
        mastery: 82, // Percentage
        trend: '+4%',
        modules: { interest: 75, research: 80, practice: 88, goals: 90 },
        weakestModule: 'Limits & Continuity',
        color: 'emerald' // Mapping to adiptify-olive conceptually
    },
    {
        id: 'physics',
        title: 'Quantum Mechanics',
        mastery: 45,
        trend: '+12%',
        modules: { interest: 90, research: 50, practice: 30, goals: 60 },
        weakestModule: 'Wave-Particle Duality',
        color: 'amber' // mapping to gold
    },
    {
        id: 'cs',
        title: 'Data Structures',
        mastery: 95,
        trend: '+2%',
        modules: { interest: 95, research: 90, practice: 98, goals: 100 },
        weakestModule: 'Dynamic Programming',
        color: 'indigo' // navy
    }
];

export default function MasteryDashboard() {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isLearningRoomOpen, setIsLearningRoomOpen] = useState(false);

    return (
        <div className="flex-1 h-full flex flex-col overflow-y-auto relative bg-slate-50/50">
            <ProctoringShield />

            <header className="px-8 py-8 md:py-10 flex justify-between items-end backdrop-blur-sm bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200/60 shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold text-adiptify-navy tracking-tight">Mastery Dashboard</h2>
                    <p className="text-slate-500 mt-1">Track your EMA-based adaptive learning progress.</p>
                </div>
                <div className="flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Mastery</p>
                        <p className="text-2xl font-bold text-adiptify-olive">74%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-adiptify-olive/20 flex items-center justify-center">
                        {/* Simple circular progress indicator mockup */}
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <path
                                className="text-slate-200"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-adiptify-olive drop-shadow-sm"
                                strokeDasharray="74, 100"
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                    </div>
                </div>
            </header>

            <div className="p-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockSubjects.map(subject => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                            onClick={() => setSelectedSubject(subject)}
                            isActive={selectedSubject?.id === subject.id}
                        />
                    ))}
                </div>
            </div>

            {/* Slide-in Right Panel */}
            <DeepDivePanel
                subject={selectedSubject}
                onClose={() => setSelectedSubject(null)}
                onEnterLearningRoom={() => setIsLearningRoomOpen(true)}
            />

            {/* Learning Room Overlay Chat */}
            <LearningRoom
                subject={selectedSubject}
                isOpen={isLearningRoomOpen}
                onClose={() => setIsLearningRoomOpen(false)}
            />
        </div>
    );
}
