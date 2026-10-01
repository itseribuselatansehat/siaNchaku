import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  CheckSquare,
  Calendar,
  FileText,
  Bell,
  UserCheck,
  Sparkles,
  Loader2,
  Clock,
  Send,
} from 'lucide-react';
import { Priority, Category, RecurrenceType, TaskStatus } from '../types';
import { getTodayDateString } from '../data/initialData';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddType,
    setQuickAddType,
    addTask,
    addSchedule,
    addNote,
    addReminder,
    addFollowUp,
    user,
  } = useApp();

  const todayStr = getTodayDateString();

  // Natural language quick input
  const [naturalInput, setNaturalInput] = useState('');
  const [isProcessingNlp, setIsProcessingNlp] = useState(false);
  const [nlpFeedback, setNlpFeedback] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [pic, setPic] = useState('');
  const [priority, setPriority] = useState<Priority>('Tinggi');
  const [category, setCategory] = useState<Category>('Pekerjaan');
  const [recurring, setRecurring] = useState<RecurrenceType>('none');
  const [reminderMinutes, setReminderMinutes] = useState(30);

  if (!isQuickAddOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(todayStr);
    setTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setPic('');
    setPriority('Tinggi');
    setCategory('Pekerjaan');
    setRecurring('none');
    setReminderMinutes(30);
    setNaturalInput('');
    setNlpFeedback(null);
  };

  const handleClose = () => {
    setIsQuickAddOpen(false);
    resetForm();
  };

  // Natural Language Command Submission (calls /api/ai/parse-command)
  const handleNaturalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    setIsProcessingNlp(true);
    setNlpFeedback(null);

    try {
      const res = await fetch('/api/ai/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: naturalInput,
          userTimezone: user.timezone,
          nowIso: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.parsed) {
        const p = data.parsed;
        // Populate form based on parsed entity
        if (p.type === 'task') {
          setQuickAddType('task');
          setTitle(p.title || naturalInput);
          if (p.description) setDescription(p.description);
          if (p.date) setDate(p.date);
          if (p.time) setTime(p.time);
          if (p.priority) setPriority(p.priority as Priority);
          if (p.category) setCategory(p.category as Category);
        } else if (p.type === 'schedule') {
          setQuickAddType('schedule');
          setTitle(p.title || naturalInput);
          if (p.description) setDescription(p.description);
          if (p.date) setDate(p.date);
          if (p.time) setTime(p.time);
          if (p.endTime) setEndTime(p.endTime);
          if (p.location) setLocation(p.location);
          if (p.priority) setPriority(p.priority as Priority);
          if (p.recurring) setRecurring(p.recurring as RecurrenceType);
        } else if (p.type === 'followup') {
          setQuickAddType('followup');
          setTitle(p.title || naturalInput);
          if (p.pic) setPic(p.pic);
          if (p.description) setDescription(p.description);
          if (p.date) setDate(p.date);
          if (p.time) setTime(p.time);
        } else if (p.type === 'note') {
          setQuickAddType('note');
          setTitle(p.title || naturalInput);
          if (p.description) setDescription(p.description);
        } else {
          setQuickAddType('reminder');
          setTitle(p.title || naturalInput);
          if (p.date) setDate(p.date);
          if (p.time) setTime(p.time);
          if (p.recurring) setRecurring(p.recurring as RecurrenceType);
        }

        setNlpFeedback(p.confirmationMessage || 'Perintah berhasil dipahami!');
      }
    } catch (err: any) {
      console.warn('NLP error:', err);
      setTitle(naturalInput);
    } finally {
      setIsProcessingNlp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (quickAddType === 'task') {
      addTask({
        title: title.trim(),
        description: description.trim(),
        deadline: `${date}T${time}`,
        priority,
        status: 'Belum dimulai' as TaskStatus,
        category,
        reminderMinutes,
        checklist: [],
        notes: '',
      });
    } else if (quickAddType === 'schedule') {
      addSchedule({
        title: title.trim(),
        date,
        startTime: time,
        endTime,
        location: location.trim(),
        description: description.trim(),
        category,
        priority,
        reminderMinutes,
        recurring,
      });
    } else if (quickAddType === 'note') {
      addNote({
        date,
        time,
        title: title.trim(),
        content: description.trim(),
        category,
        priority,
        tags: [category],
      });
    } else if (quickAddType === 'reminder') {
      addReminder({
        title: title.trim(),
        date,
        time,
        type: 'custom',
        recurring,
        status: 'pending',
      });
    } else if (quickAddType === 'followup') {
      addFollowUp({
        title: title.trim(),
        pic: pic.trim() || 'Rekan Kerja',
        lastContactDate: date,
        notes: description.trim(),
        deadline: date,
        status: 'Perlu Dihubungi Lagi',
        reminderTime: time,
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tambah Cepat SiaNcaku
              </h3>
              <p className="text-[11px] text-slate-500">
                Ketik instruksi bahasa natural atau isi formulir di bawah
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Natural Language Smart Input Bar */}
        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/60">
          <form onSubmit={handleNaturalSubmit} className="relative flex items-center">
            <input
              type="text"
              value={naturalInput}
              onChange={e => setNaturalInput(e.target.value)}
              placeholder='Contoh: "Besok jam 9 ingatkan saya rapat koordinasi"...'
              className="w-full pl-3.5 pr-20 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={isProcessingNlp || !naturalInput.trim()}
              className="absolute right-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1 transition"
            >
              {isProcessingNlp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Proses</span>
                </>
              )}
            </button>
          </form>
          {nlpFeedback && (
            <div className="mt-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{nlpFeedback}</span>
            </div>
          )}
        </div>

        {/* Tabs for Entity Type */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setQuickAddType('task')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              quickAddType === 'task'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tugas</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickAddType('schedule')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              quickAddType === 'schedule'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickAddType('note')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              quickAddType === 'note'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Catatan</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickAddType('reminder')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              quickAddType === 'reminder'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Reminder</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickAddType('followup')}
            className={`flex-1 min-w-[70px] py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              quickAddType === 'followup'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Follow Up</span>
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {quickAddType === 'task'
                ? 'Nama Tugas *'
                : quickAddType === 'schedule'
                ? 'Judul Agenda *'
                : quickAddType === 'note'
                ? 'Judul Catatan *'
                : quickAddType === 'followup'
                ? 'Pekerjaan yang Di-follow Up *'
                : 'Judul Pengingat *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ketik judul kegiatan atau pekerjaan..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {quickAddType === 'followup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dengan Siapa (PIC) *
              </label>
              <input
                type="text"
                required
                value={pic}
                onChange={e => setPic(e.target.value)}
                placeholder="Contoh: Pak Budi (Kepegawaian)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {quickAddType === 'schedule' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi / Ruangan
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Contoh: Ruang Rapat Lt. 2 / Zoom Meeting"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {quickAddType === 'note' ? 'Isi Catatan / Notula *' : 'Deskripsi / Detail'}
            </label>
            <textarea
              rows={quickAddType === 'note' ? 4 : 2}
              required={quickAddType === 'note'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tambahkan detail, catatan, atau tindak lanjut..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date and Time row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {quickAddType === 'task' ? 'Batas Waktu' : quickAddType === 'schedule' ? 'Mulai' : 'Waktu'}
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {quickAddType === 'schedule' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selesai
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pekerjaan">Pekerjaan</option>
                <option value="Pribadi">Pribadi</option>
                <option value="Rapat">Rapat</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Ide">Ide</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tinggi">🔴 Tinggi</option>
                <option value="Sedang">🟡 Sedang</option>
                <option value="Rendah">🟢 Rendah</option>
              </select>
            </div>

            {(quickAddType === 'schedule' || quickAddType === 'reminder') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pengulangan
                </label>
                <select
                  value={recurring}
                  onChange={e => setRecurring(e.target.value as RecurrenceType)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">Sekali</option>
                  <option value="daily">Setiap hari</option>
                  <option value="weekly">Setiap minggu</option>
                  <option value="monthly">Setiap bulan</option>
                  <option value="workdays">Hari kerja (Senin-Jumat)</option>
                </select>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              Simpan {quickAddType === 'task' ? 'Tugas' : quickAddType === 'schedule' ? 'Agenda' : quickAddType === 'note' ? 'Catatan' : quickAddType === 'followup' ? 'Follow Up' : 'Pengingat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
