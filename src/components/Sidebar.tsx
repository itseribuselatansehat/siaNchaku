import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  FileText,
  Bell,
  UserCheck,
  Bot,
  BarChart3,
  History,
  FileSpreadsheet,
  Settings,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { todayStats, reminders, tasks } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    {
      id: 'schedules',
      label: 'Jadwal / Agenda',
      icon: Calendar,
      badge: todayStats.agendaCount > 0 ? todayStats.agendaCount : null,
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      id: 'tasks',
      label: 'Tugas Saya',
      icon: CheckSquare,
      badge: todayStats.tasksPending > 0 ? todayStats.tasksPending : null,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    { id: 'notes', label: 'Catatan Harian', icon: FileText, badge: null },
    {
      id: 'reminders',
      label: 'Pengingat',
      icon: Bell,
      badge: todayStats.remindersTodayCount > 0 ? todayStats.remindersTodayCount : null,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    { id: 'followups', label: 'Follow Up', icon: UserCheck, badge: null },
    { id: 'ai', label: 'SiaNcaku AI', icon: Bot, isHighlight: true },
    { id: 'stats', label: 'Statistik', icon: BarChart3, badge: null },
    { id: 'activities', label: 'Riwayat Aktivitas', icon: History, badge: null },
    { id: 'gas', label: 'Google Sheets & GAS', icon: FileSpreadsheet, badge: 'Setup' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, badge: null },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>SiaNcaku</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xs">
                  AI PRO
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                Tidak pernah lupa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                    : item.isHighlight
                    ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-sky-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.isHighlight
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom SiaNcaku Proactive Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-100 to-purple-500/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SiaNcaku Aktif</span>
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Pengingat otomatis aktif memantau agenda & tenggat waktu pekerjaan Anda.
          </p>
        </div>
      </aside>
    </>
  );
};
