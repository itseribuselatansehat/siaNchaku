import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Calendar, CheckSquare, AlertTriangle, Bell, ArrowRight, X, Sparkles } from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const MorningBriefingModal: React.FC = () => {
  const { isMorningBriefingOpen, setIsMorningBriefingOpen, todayStats, schedules, tasks, user } = useApp();

  if (!isMorningBriefingOpen) return null;

  const todayStr = getTodayDateString();
  const todaySchedules = schedules
    .filter(s => s.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  const firstAgenda = todaySchedules[0];

  const todayTasks = tasks.filter(t => t.deadline.startsWith(todayStr));
  const primaryDeadlineTask = todayTasks.find(t => t.priority === 'Tinggi') || todayTasks[0];

  const motivationalQuotes = [
    'Fokus pada satu langkah di hadapan Anda, selesaikan dengan tuntas dan tenang.',
    'Produktivitas bukan tentang melakukan segalanya, melainkan menyelesaikan hal yang paling bernilai.',
    'Awali pagi dengan kejernihan pikiran, SiaNcaku siap mendampingi setiap agenda Anda.',
    'Disiplin pada hal kecil hari ini akan membuka keberhasilan besar di kemudian hari.',
  ];
  // Select quote based on day of month
  const quoteIndex = new Date().getDate() % motivationalQuotes.length;
  const quote = motivationalQuotes[quoteIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header gradient banner */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 p-6 text-white">
          <button
            onClick={() => setIsMorningBriefingOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Sun className="w-6 h-6 text-amber-100" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-100">
              Briefing Pagi SiaNcaku
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Selamat Pagi, {user.nickname || user.name}! 👋
          </h2>
          <p className="text-xs text-amber-50 mt-1">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Berikut ringkasan kesiapan aktivitas Anda hari ini:
          </p>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center">
              <Calendar className="w-4 h-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {todayStats.agendaCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Agenda</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
              <CheckSquare className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {todayStats.tasksTotal}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tugas</div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-center">
              <AlertTriangle className="w-4 h-4 mx-auto text-rose-600 dark:text-rose-400 mb-1" />
              <div className="text-lg font-bold text-rose-700 dark:text-rose-300">
                {todayStats.deadlinesTodayCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Deadline</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center">
              <Bell className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
              <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {todayStats.remindersTodayCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pengingat</div>
            </div>
          </div>

          {/* Focal Highlights */}
          <div className="space-y-2.5">
            {firstAgenda ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {firstAgenda.startTime}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Agenda Pertama
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {firstAgenda.title}
                  </div>
                  {firstAgenda.location && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      📍 {firstAgenda.location}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 text-center">
                Belum ada agenda rapat terjadwal hari ini. Waktu fleksibel untuk fokus bekerja.
              </div>
            )}

            {primaryDeadlineTask && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  {primaryDeadlineTask.deadline.includes('T')
                    ? primaryDeadlineTask.deadline.split('T')[1].substring(0, 5)
                    : '17:00'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Deadline Prioritas Hari Ini
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {primaryDeadlineTask.title}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Motivation Quote */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs italic text-indigo-900 dark:text-indigo-200 leading-relaxed">
              "{quote}"
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsMorningBriefingOpen(false)}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-semibold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
          >
            <span>Mulai Hari Ini</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
