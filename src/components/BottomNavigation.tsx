import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Plus,
  Bot,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const { openQuickAdd, todayStats } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        {/* Jadwal */}
        <button
          onClick={() => onSelectTab('schedules')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'schedules'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Jadwal</span>
          {todayStats.agendaCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Floating Quick Add */}
        <button
          onClick={() => openQuickAdd('task')}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-90 transition"
          title="Tambah Cepat"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Tugas */}
        <button
          onClick={() => onSelectTab('tasks')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'tasks'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tugas</span>
          {todayStats.tasksPending > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        {/* AsistenKu AI */}
        <button
          onClick={() => onSelectTab('ai')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
            currentTab === 'ai'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-[10px] mt-0.5">AI Cerdas</span>
        </button>

        {/* Menu / Lainnya */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
};
