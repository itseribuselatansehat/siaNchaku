import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, CheckCircle2, Clock, Calendar, ArrowRight, X, AlertCircle } from 'lucide-react';
import { getTodayDateString, getTomorrowDateString } from '../data/initialData';

export const EveningReviewModal: React.FC = () => {
  const {
    isEveningReviewOpen,
    setIsEveningReviewOpen,
    tasks,
    schedules,
    rollOverPendingTasksToTomorrow,
    user,
  } = useApp();

  const [rolledOverCount, setRolledOverCount] = useState<number | null>(null);

  if (!isEveningReviewOpen) return null;

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  const todayTasks = tasks.filter(t => t.deadline.startsWith(todayStr));
  const completedTasks = todayTasks.filter(t => t.status === 'Selesai');
  const pendingTasks = todayTasks.filter(t => t.status !== 'Selesai');

  const todaySchedules = schedules.filter(s => s.date === todayStr);

  const handleRollOver = () => {
    const count = rollOverPendingTasksToTomorrow();
    setRolledOverCount(count);
    setTimeout(() => {
      setIsEveningReviewOpen(false);
      setRolledOverCount(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header gradient banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 p-6 text-white">
          <button
            onClick={() => setIsEveningReviewOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Moon className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
              Review Hari Ini
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Evaluasi Hari Ini, {user.nickname || user.name} 🌙
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Momen tenang untuk merefleksikan capaian dan mempersiapkan hari esok tanpa beban.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {completedTasks.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tugas Selesai</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-center">
              <Clock className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
              <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {pendingTasks.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Belum Selesai</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-center">
              <Calendar className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {todaySchedules.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Agenda Terlaksana</div>
            </div>
          </div>

          {/* Pending Tasks List Preview */}
          {pendingTasks.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Pekerjaan Belum Selesai Hari Ini ({pendingTasks.length})</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate mr-2">
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        task.priority === 'Tinggi'
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rollover Prompt */}
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/80">
                <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
                  Apakah tugas yang belum selesai ingin dipindahkan ke besok ({tomorrowStr})?
                </p>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-1">
                  SiaNcaku akan memperbarui batas waktu dan mengatur ulang pengingat otomatisnya.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-center">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Luar biasa! Semua tugas hari ini berhasil diselesaikan dengan baik 🎉
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Waktunya beristirahat dan memulihkan energi untuk esok hari.
              </p>
            </div>
          )}

          {/* Result Banner if rolled over */}
          {rolledOverCount !== null && (
            <div className="p-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold text-center animate-fade-in">
              ✅ Berhasil memindahkan {rolledOverCount} tugas ke besok!
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {pendingTasks.length > 0 ? (
              <>
                <button
                  onClick={handleRollOver}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Ya, Pindahkan ke Besok</span>
                </button>
                <button
                  onClick={() => setIsEveningReviewOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  Tetap Hari Ini
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEveningReviewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Selesai & Istirahat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
