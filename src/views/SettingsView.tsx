import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  User,
  Clock,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Globe,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { soundAndNotify } from '../utils/soundAndNotification';

export const SettingsView: React.FC = () => {
  const { user, updateUser, resetToDefaults } = useApp();

  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [workStart, setWorkStart] = useState(user.workStart);
  const [workEnd, setWorkEnd] = useState(user.workEnd);
  const [timezone, setTimezone] = useState(user.timezone);
  const [morningBriefingTime, setMorningBriefingTime] = useState(user.morningBriefingTime);
  const [eveningReviewTime, setEveningReviewTime] = useState(user.eveningReviewTime);
  const [defaultReminderMinutes, setDefaultReminderMinutes] = useState(user.defaultReminderMinutes);
  const [soundEnabled, setSoundEnabled] = useState(user.soundEnabled);
  const [theme, setTheme] = useState(user.theme);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      nickname,
      email,
      avatar,
      workStart,
      workEnd,
      timezone,
      morningBriefingTime,
      eveningReviewTime,
      defaultReminderMinutes: Number(defaultReminderMinutes),
      soundEnabled,
      theme,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestSound = () => {
    soundAndNotify.playChime('reminder');
  };

  const handleTestWebPush = async () => {
    const granted = await soundAndNotify.requestNotificationPermission();
    if (granted) {
      soundAndNotify.showWebNotification(
        '🔔 Pengingat SiaNcaku',
        'Notifikasi browser berhasil diaktifkan untuk Asisten pribadi Anda.'
      );
      updateUser({ webPushEnabled: true });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          <span>Pengaturan & Personalisasi</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sesuaikan profil, jam kerja, waktu briefing otomatis, notifikasi, dan tema aplikasi
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Profil Pengguna */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Profil & Identitas
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-600/40"
            />
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih Foto Avatar:
              </span>
              <div className="flex items-center gap-2">
                {sampleAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                      avatar === url ? 'border-indigo-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Panggilan (Digunakan dalam Sapaan Asisten)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Contoh: Pak Budi"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Zona Waktu
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="Asia/Jakarta (GMT+7)">WIB (Asia/Jakarta - GMT+7)</option>
                  <option value="Asia/Makassar (GMT+8)">WITA (Asia/Makassar - GMT+8)</option>
                  <option value="Asia/Jayapura (GMT+9)">WIT (Asia/Jayapura - GMT+9)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Jam Kerja & Briefing Otomatis */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Jadwal Kerja & Waktu Evaluasi
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mulai Jam Kerja
              </label>
              <input
                type="time"
                value={workStart}
                onChange={e => setWorkStart(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selesai Jam Kerja
              </label>
              <input
                type="time"
                value={workEnd}
                onChange={e => setWorkEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Morning Briefing
              </label>
              <input
                type="time"
                value={morningBriefingTime}
                onChange={e => setMorningBriefingTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Review Hari Ini
              </label>
              <input
                type="time"
                value={eveningReviewTime}
                onChange={e => setEveningReviewTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* 3. Notifikasi & Tampilan */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notifikasi & Suara
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-indigo-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Efek Suara Chime
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bunyikan nada harmonik saat pengingat atau tugas selesai
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !soundEnabled;
                  setSoundEnabled(newVal);
                  if (newVal) soundAndNotify.playChime('reminder');
                }}
                className={`w-11 h-6 rounded-full transition p-0.5 ${
                  soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Notifikasi Desktop / Web Push
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kirim notifikasi di sudut layar perangkat Anda
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestWebPush}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
              >
                Izinkan
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tema Tampilan Aplikasi:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  theme === 'light'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Terang</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  theme === 'dark'
                    ? 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Gelap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengatur ulang data ke contoh awal?')) {
                resetToDefaults();
                alert('Data berhasil diatur ulang ke kondisi awal.');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Contoh Awal</span>
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Tersimpan!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
