import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { AICoach } from './components/AICoach';
import { Goals } from './components/Goals';
import { ActionItems } from './components/ActionItems';
import { DailyLogger } from './components/DailyLogger';
import { GreenCareers } from './components/GreenCareers';
import { 
  LayoutDashboard, Calculator as CalcIcon, Bot, Target, CheckSquare, 
  CalendarRange, Briefcase, Database, CloudOff, Loader2 
} from 'lucide-react';

const SidebarLink: React.FC<{ 
  tab: string; 
  label: string; 
  icon: React.ReactNode; 
}> = ({ tab, label, icon }) => {
  const { activeTab, setActiveTab } = useApp();
  const isActive = activeTab === tab;

  return (
    <button
      onClick={() => setActiveTab(tab)}
      data-tab={tab}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        isActive 
          ? 'bg-eco-green text-black font-extrabold shadow-glow' 
          : 'text-dark-muted hover:text-white hover:bg-dark-hover/45'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const AppContent: React.FC = () => {
  const { activeTab, loading, isUsingFallback } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calculator': return <Calculator />;
      case 'coach': return <AICoach />;
      case 'goals': return <Goals />;
      case 'actions': return <ActionItems />;
      case 'logger': return <DailyLogger />;
      case 'careers': return <GreenCareers />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-dark-bg text-white">
        <Loader2 className="h-10 w-10 text-eco-green animate-spin" />
        <span className="text-sm text-dark-muted font-semibold">EcoTrack AI is booting up...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-bg">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-dark-card border-b lg:border-b-0 lg:border-r border-dark-border/40 p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-3xl">🌱</span>
            <div>
              <span className="text-lg font-display font-extrabold text-white tracking-tight block">EcoTrack AI</span>
              <span className="text-[10px] text-eco-green font-bold uppercase tracking-wider block">Carbon Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <SidebarLink tab="dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4.5 w-4.5" />} />
            <SidebarLink tab="calculator" label="Carbon Calculator" icon={<CalcIcon className="h-4.5 w-4.5" />} />
            <SidebarLink tab="coach" label="AI Carbon Coach" icon={<Bot className="h-4.5 w-4.5" />} />
            <SidebarLink tab="goals" label="Target Goals" icon={<Target className="h-4.5 w-4.5" />} />
            <SidebarLink tab="actions" label="Actions Checklist" icon={<CheckSquare className="h-4.5 w-4.5" />} />
            <SidebarLink tab="logger" label="Daily Habit Log" icon={<CalendarRange className="h-4.5 w-4.5" />} />
            <SidebarLink tab="careers" label="Green Careers" icon={<Briefcase className="h-4.5 w-4.5" />} />
          </nav>
        </div>

        {/* Database Status indicator */}
        <div className="mt-8 pt-4 border-t border-dark-border/30 px-2">
          {isUsingFallback ? (
            <div className="flex items-center gap-2 text-[10px] text-eco-amber">
              <CloudOff className="h-4 w-4" />
              <span>Offline Sandbox Mode (Local)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-eco-green">
              <Database className="h-4 w-4" />
              <span>Express API Connected</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl">
        {renderActiveView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
