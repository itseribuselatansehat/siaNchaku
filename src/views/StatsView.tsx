import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const StatsView: React.FC = () => {
  const { tasks, schedules, reminders, todayStats } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Selesai').length;
  const pendingTasks = totalTasks - completedTasks;

  const todayStr = getTodayDateString();
  const overdueTasks = tasks.filter(
    t => t.status !== 'Selesai' && t.deadline.split('T')[0] < todayStr
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Day-of-week productivity mock/computed distribution
  const daysOfWeek = [
    { day: 'Senin', completed: 4, target: 5 },
    { day: 'Selasa', completed: 5, target: 5 },
    { day: 'Rabu', completed: 3, target: 4 },
    { day: 'Kamis', completed: completedTasks > 0 ? completedTasks : 4, target: 5 },
    { day: 'Jumat', completed: 2, target: 4 },
    { day: 'Sabtu', completed: 1, target: 2 },
    { day: 'Minggu', completed: 1, target: 1 },
  ];

  // Category breakdown
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Statistik & Produktivitas</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pantau rasio penyelesaian tugas mingguan, beban kerja, dan efektivitas waktu Anda
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Tugas</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalTasks}
          </div>
          <span className="text-[11px] text-slate-400">Semua aktivitas</span>
        </div>

        {/* Completed Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tugas Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {completedTasks}
          </div>
          <span className="text-[11px] text-emerald-600/80 font-medium">
            {completionRate}% rasio keberhasilan
          </span>
        </div>

        {/* Pending Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tugas Tertunda</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingTasks}
          </div>
          <span className="text-[11px] text-slate-400">Dalam proses</span>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Deadline Terlewat</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {overdueTasks}
          </div>
          <span className="text-[11px] text-rose-500 font-medium">Perlu perhatian</span>
        </div>
      </div>

      {/* Visual Chart: Weekly Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Penyelesaian Tugas per Hari (Minggu Ini)
              </h3>
              <p className="text-[11px] text-slate-400">Konsistensi kerja harian Anda</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>Stabil & Baik</span>
            </div>
          </div>

          {/* Bar Chart representation */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-slate-100 dark:border-slate-800 pb-2">
              {daysOfWeek.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.completed / 6) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-600 transition">
                      {item.completed}
                    </div>
                    <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700"
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Breakdown & Overall Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skor Efektivitas
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/60 text-center">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {completionRate}%
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                Penyelesaian Tugas
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {completionRate >= 75
                  ? 'Performa kerja luar biasa! Tetap jaga keseimbangan.'
                  : 'Fokuskan prioritas pada tugas berlabel merah.'}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Beban per Kategori:
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>{cat}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
