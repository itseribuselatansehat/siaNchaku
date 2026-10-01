import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Plus,
  Clock,
  Repeat,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundAndNotify } from '../utils/soundAndNotification';
import { ReminderItem, RecurrenceType } from '../types';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    addReminder,
    deleteReminder,
    dismissReminder,
    snoozeReminder,
    openQuickAdd,
    user,
  } = useApp();

  const [notificationStatus, setNotificationStatus] = useState<string>('idle');

  const handleTestNotification = async () => {
    soundAndNotify.playChime('reminder');
    const granted = await soundAndNotify.requestNotificationPermission();
    if (granted) {
      soundAndNotify.showWebNotification(
        '🔔 Pengingat SiaNcaku (Uji Coba)',
        'Sistem pengingat aktif dan siap memberitahu Anda tepat waktu!'
      );
      setNotificationStatus('granted');
    } else {
      setNotificationStatus('denied');
    }
  };

  const pendingList = reminders.filter(r => r.status === 'pending');
  const triggeredList = reminders.filter(r => r.status === 'triggered' || r.status === 'dismissed');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Pengingat & Alarm SiaNcaku</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mekanisme pengingat proaktif yang tidak pernah lupa dengan audio chime dan browser push
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Sound & Notification */}
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            title="Tes Suara Notifikasi"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Uji Suara</span>
          </button>

          <button
            onClick={() => openQuickAdd('reminder')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Reminder</span>
          </button>
        </div>
      </div>

      {/* Info Card: How reminder engine works */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
              Engine Pengingat Real-Time Aktif
            </h4>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
              SiaNcaku memeriksa jadwal & deadline setiap 10 detik. Pengingat berulang secara otomatis diperbarui ke tanggal berikutnya setelah berbunyi.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestNotification}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 transition"
        >
          {notificationStatus === 'granted' ? 'Notifikasi Aktif ✅' : 'Izinkan Notifikasi Web'}
        </button>
      </div>

      {/* 1. Pengingat Aktif (Pending) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Pengingat Menunggu Jadwal</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              {pendingList.length}
            </span>
          </h3>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Tidak ada pengingat aktif yang menunggu saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingList.map(rem => (
              <div
                key={rem.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {rem.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      <span>📅 {rem.date}</span>
                      <span>•</span>
                      <span>⏰ {rem.time} WIB</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Tipe: {rem.type}
                      </span>
                      {rem.recurring !== 'none' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Repeat className="w-3 h-3" /> {rem.recurring}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button
                    onClick={() => snoozeReminder(rem.id, 10)}
                    className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    Tunda 10m
                  </button>
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Pengingat Selesai / Riwayat Berbunyi */}
      {triggeredList.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Riwayat Pengingat Terkirim
            </h3>
          </div>

          <div className="space-y-2">
            {triggeredList.map(rem => (
              <div
                key={rem.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {rem.title}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ({rem.date} {rem.time})
                  </span>
                </div>

                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
