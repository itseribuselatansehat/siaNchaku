import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenAi }) => {
  const {
    user,
    updateUser,
    openQuickAdd,
    setIsSearchOpen,
    activeAlerts,
    reminders,
    tasks,
  } = useApp();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}:${secs}`);

      const h = now.getHours();
      if (h >= 4 && h < 11) setGreeting('Selamat Pagi');
      else if (h >= 11 && h < 15) setGreeting('Selamat Siang');
      else if (h >= 15 && h < 18) setGreeting('Selamat Sore');
      else setGreeting('Selamat Malam');

      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingRemindersCount = reminders.filter(r => r.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu toggle + Greeting & Clock */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>{greeting}, {user.nickname || user.name.split(' ')[0]}</span>
                <span className="inline-block animate-wave origin-bottom-right">👋</span>
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>SiaNcaku Siaga</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                {currentTime || '08:00:00'}
              </span>
              <span>•</span>
              <span className="hidden sm:inline capitalize">{currentDateStr}</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar Button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cari agenda, tugas, catatan, pengingat...</span>
            </span>
            <kbd className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Add + AI + Theme + Install + Profile */}
        <div className="flex items-center gap-2">
          {/* Search button on mobile */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Cari"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => openQuickAdd('task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 active:scale-95 transition"
            title="Tambah Cepat"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>

          {/* SiaNcaku AI quick trigger */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold shadow-sm shadow-purple-600/25 transition active:scale-95"
            title="Asisten Cerdas SiaNcaku"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden lg:inline">AI SiaNcaku</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={() => updateUser({ theme: user.theme === 'dark' ? 'light' : 'dark' })}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={user.theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {user.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Avatar */}
          <div className="relative flex items-center pl-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/40 shadow-xs"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                pendingRemindersCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
              title="Status SiaNcaku: Aktif"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
