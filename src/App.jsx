import React, { useState } from 'react';
import MasteryDashboard from './components/dashboard/MasteryDashboard';
import { BookOpen, BarChart2, MessageSquare, Settings, User } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-adiptify-navy text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-adiptify-gold to-adiptify-terracotta flex items-center justify-center font-bold text-adiptify-navy">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Adiptify</h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <NavItem
            icon={<BarChart2 size={20} />}
            label="Mastery Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Study Modules"
            active={activeTab === 'modules'}
            onClick={() => setActiveTab('modules')}
          />
          <NavItem
            icon={<MessageSquare size={20} />}
            label="AI Tutor"
            active={activeTab === 'tutor'}
            onClick={() => setActiveTab('tutor')}
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-adiptify-navy bg-gradient-to-br from-slate-200 to-slate-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">Student User</p>
              <p className="text-xs text-slate-400">View Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'dashboard' && <MasteryDashboard />}
        {activeTab !== 'dashboard' && (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p>Module content placeholder</p>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
          ? 'bg-adiptify-gold/10 text-adiptify-gold font-medium shadow-sm'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
    >
      <span className={active ? 'text-adiptify-gold' : 'text-slate-400'}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default App;
