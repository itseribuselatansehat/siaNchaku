import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckSquare,
  Clock,
  Bell,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  CheckCircle2,
  FileText,
  UserCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    user,
    tasks,
    schedules,
    notes,
    reminders,
    followUps,
    todayStats,
    toggleTaskStatus,
    openQuickAdd,
    setIsMorningBriefingOpen,
    setIsEveningReviewOpen,
  } = useApp();

  const todayStr = getTodayDateString();

  // Greeting by hour
  const currentHour = new Date().getHours();
  let greetingTime = 'Selamat Pagi';
  if (currentHour >= 11 && currentHour < 15) greetingTime = 'Selamat Siang';
  else if (currentHour >= 15 && currentHour < 18) greetingTime = 'Selamat Sore';
  else if (currentHour >= 18 || currentHour < 4) greetingTime = 'Selamat Malam';

  // Today schedules sorted by start time
  const todaySchedules = schedules
    .filter(s => s.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next upcoming schedule
  const nowTime = `${String(currentHour).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const nextSchedule = todaySchedules.find(s => s.startTime >= nowTime) || todaySchedules[0];

  // Today tasks
  const todayTasks = tasks.filter(t => t.deadline.startsWith(todayStr));
  const completedTasks = todayTasks.filter(t => t.status === 'Selesai');
  const pendingTasks = todayTasks.filter(t => t.status !== 'Selesai');

  // Next reminder
  const pendingReminders = reminders
    .filter(r => r.date === todayStr && r.status === 'pending')
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextReminder = pendingReminders[0];

  // Priority Grouping
  const urgentTasks = tasks.filter(
    t => t.status !== 'Selesai' && t.priority === 'Tinggi' && t.deadline.split('T')[0] <= todayStr
  );

  const deadlineTasks = todayTasks.filter(t => t.status !== 'Selesai');
  const pendingFollowups = followUps.filter(f => f.status !== 'Selesai');

  // Progress percentage
  const progressPercent =
    todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Banner with Ultra-Premium Glassmorphism & Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-900 text-white p-6 sm:p-8 shadow-2xl border border-white/10">
        {/* Glow ambient backdrops */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-indigo-100 border border-white/10 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SiaNcaku: Asisten pribadi yang tidak pernah lupa</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              {greetingTime}, {user.nickname || user.name}! 👋
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              Ada <strong className="text-white font-extrabold">{todayStats.agendaCount} agenda</strong> hari ini.
              {todayStats.tasksPending > 0 ? (
                <> <strong className="text-amber-200 font-extrabold">{todayStats.tasksPending} pekerjaan</strong> masih belum selesai.</>
              ) : (
                ' Seluruh agenda dan tugas hari ini telah diselesaikan dengan rapi!'
              )}
            </p>

            {/* Quick Action Pills inside banner */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsMorningBriefingOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition active:scale-95 shadow-xs"
              >
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Morning Briefing</span>
              </button>

              <button
                onClick={() => setIsEveningReviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition active:scale-95 shadow-xs"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-200" />
                <span>Review Hari Ini</span>
              </button>

              <button
                onClick={() => openQuickAdd('task')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs shadow-md shadow-black/10 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-700" />
                <span>Tambah Tugas</span>
              </button>
            </div>
          </div>

          {/* Progress Card with Radial Visual Accent */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[190px] text-center shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Progres Capaian</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black mt-1 text-white">
              {progressPercent}%
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-indigo-100 mt-2.5 font-medium">
              {completedTasks.length} dari {todayTasks.length} tugas selesai
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Agenda */}
        <div
          onClick={() => onNavigateTab('schedules')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/60 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {todayStats.agendaCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Agenda Hari Ini
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {nextSchedule ? `Berikutnya: ${nextSchedule.startTime} WIB` : 'Tidak ada agenda'}
            </div>
          </div>
        </div>

        {/* Card 2: Tugas Belum Selesai */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {todayStats.tasksPending}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tugas Belum Selesai
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {urgentTasks.length > 0 ? `🔥 ${urgentTasks.length} prioritas tinggi` : 'Terkontrol'}
            </div>
          </div>
        </div>

        {/* Card 3: Tugas Selesai */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/60 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {completedTasks.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tugas Selesai
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {todayTasks.length > 0 ? `${progressPercent}% selesai` : '0 tugas'}
            </div>
          </div>
        </div>

        {/* Card 4: Pengingat Berikutnya */}
        <div
          onClick={() => onNavigateTab('reminders')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/60 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Lihat <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {nextReminder ? nextReminder.time : '—'}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pengingat Berikutnya
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {nextReminder ? nextReminder.title : 'Tidak ada pengingat hari ini'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Agenda Timeline + Smart Priorities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda Hari Ini Timeline */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Agenda & Jadwal Hari Ini
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Jadwal pertemuan dan kegiatan terencana
                  </p>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('schedule')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Agenda
              </button>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Tidak ada agenda yang dijadwalkan untuk hari ini. Waktu Anda fleksibel!
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map(sch => {
                  const isPast = sch.endTime < nowTime;
                  const isCurrent = sch.startTime <= nowTime && sch.endTime >= nowTime;
                  return (
                    <div
                      key={sch.id}
                      className={`relative p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/60 dark:to-purple-950/60 border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-md'
                          : isPast
                          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-xs'
                      }`}
                    >
                      {/* Time pill */}
                      <div className="text-center shrink-0 min-w-[56px]">
                        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
                          {sch.startTime}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {sch.endTime}
                        </span>
                        {isCurrent && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white animate-pulse">
                            Berlangsung
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {sch.title}
                          </h4>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              sch.priority === 'Tinggi'
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {sch.category}
                          </span>
                        </div>
                        {sch.location && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate font-medium">
                            📍 {sch.location}
                          </p>
                        )}
                        {sch.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {sch.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Smart Priority Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Pengelompokan Prioritas Cerdas SiaNcaku</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Otomatis dipantau</span>
            </div>

            {/* 1. 🔥 Harus Dikerjakan Sekarang */}
            <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <span>🔥 Harus Dikerjakan Sekarang</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                    {urgentTasks.length}
                  </span>
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                  Prioritas Utama
                </span>
              </div>

              {urgentTasks.length === 0 ? (
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80 font-medium pt-1">
                  Tidak ada tugas darurat saat ini. Ritme kerja aman!
                </p>
              ) : (
                <div className="space-y-2 mt-3">
                  {urgentTasks.map(t => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className="w-5 h-5 rounded-md border-2 border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition shrink-0"
                          title="Tandai Selesai"
                        />
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                            {t.title}
                          </span>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-medium">
                            Deadline: {t.deadline.replace('T', ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTaskStatus(t.id, 'Selesai')}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shrink-0 transition shadow-xs"
                      >
                        Selesaikan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. ⚠️ Deadline Hari Ini */}
            <div className="p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Deadline Hari Ini</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                    {deadlineTasks.length}
                  </span>
                </span>
                <button
                  onClick={() => onNavigateTab('tasks')}
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Kelola Semua
                </button>
              </div>

              {deadlineTasks.length === 0 ? (
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 font-medium pt-1">
                  Semua tugas hari ini telah rampung.
                </p>
              ) : (
                <div className="space-y-1.5 mt-3">
                  {deadlineTasks.map(t => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate mr-2">
                        {t.title}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                        {t.deadline.includes('T') ? t.deadline.split('T')[1].substring(0, 5) : '17:00'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Follow Ups + Catatan Penting */}
        <div className="space-y-6">
          {/* Follow Up Pending */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  <UserCheck className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tindak Lanjut (Follow Up)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('followups')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            {pendingFollowups.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">Tidak ada tanggungan follow up.</p>
            ) : (
              <div className="space-y-2.5">
                {pendingFollowups.slice(0, 3).map(f => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs hover:border-cyan-500/40 transition"
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {f.title}
                    </div>
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold mt-0.5">
                      👤 {f.pic}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {f.notes}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catatan Penting Terkini */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Catatan Harian Terbaru
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('notes')}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Buka
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 p-2">Belum ada catatan hari ini.</p>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 2).map(n => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate mr-2">
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
