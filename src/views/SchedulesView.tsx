import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Repeat,
  Bell,
  CheckCircle2,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { ScheduleItem } from '../types';
import { getTodayDateString } from '../data/initialData';

export const SchedulesView: React.FC = () => {
  const {
    schedules,
    tasks,
    reminders,
    deleteSchedule,
    updateSchedule,
    openQuickAdd,
  } = useApp();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewCalendarMode, setViewCalendarMode] = useState<'month' | 'week' | 'day'>('month');

  // Month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Month days generator
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start (0 = Mon ... 6 = Sun)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasAgenda: boolean;
      hasDeadline: boolean;
      hasReminder: boolean;
      hasDone: boolean;
    }> = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAgenda: schedules.some(s => s.date === dateStr),
        hasDeadline: tasks.some(t => t.deadline.startsWith(dateStr) && t.status !== 'Selesai'),
        hasReminder: reminders.some(r => r.date === dateStr),
        hasDone: tasks.some(t => t.deadline.startsWith(dateStr) && t.status === 'Selesai'),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAgenda: schedules.some(s => s.date === dateStr),
        hasDeadline: tasks.some(t => t.deadline.startsWith(dateStr) && t.status !== 'Selesai'),
        hasReminder: reminders.some(r => r.date === dateStr),
        hasDone: tasks.some(t => t.deadline.startsWith(dateStr) && t.status === 'Selesai'),
      });
    }

    // Next month padding to reach multiple of 7
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAgenda: schedules.some(s => s.date === dateStr),
        hasDeadline: tasks.some(t => t.deadline.startsWith(dateStr) && t.status !== 'Selesai'),
        hasReminder: reminders.some(r => r.date === dateStr),
        hasDone: tasks.some(t => t.deadline.startsWith(dateStr) && t.status === 'Selesai'),
      });
    }

    return days;
  }, [year, month, selectedDate, todayStr, schedules, tasks, reminders]);

  // Selected date events
  const selectedSchedules = schedules
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const selectedTasks = tasks.filter(t => t.deadline.startsWith(selectedDate));
  const selectedReminders = reminders.filter(r => r.date === selectedDate);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Jadwal & Agenda</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kalender terintegrasi dengan indikator warna deadline, reminder, dan agenda rapat
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setViewCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewCalendarMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setViewCalendarMode('day')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewCalendarMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Harian
            </button>
          </div>

          <button
            onClick={() => openQuickAdd('schedule')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (or top), Events on Right (or bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Calendar (7 Cols on desktop) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {currentMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                Hari Ini
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Legend (Requirement 12) */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 py-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>🔵 Agenda</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>🔴 Deadline</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>🟡 Reminder</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>🟢 Selesai</span>
            </span>
          </div>

          {/* Calendar Table Grid */}
          <div>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span className="text-indigo-500">Sab</span>
              <span className="text-rose-500">Min</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((d, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`min-h-[58px] sm:min-h-[64px] p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all ${
                    d.isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs'
                      : d.isToday
                      ? 'border-indigo-400/80 bg-slate-50 dark:bg-slate-800/80'
                      : d.isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : 'border-transparent opacity-30 hover:opacity-60'
                  }`}
                >
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      d.isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : d.isToday
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {d.dayNumber}
                  </span>

                  {/* Indicator Color Dots */}
                  <div className="flex items-center gap-1 mt-1">
                    {d.hasAgenda && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    {d.hasDeadline && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    {d.hasReminder && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    {d.hasDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Events & Details (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Agenda Tanggal Terpilih
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h4>
              </div>
              <button
                onClick={() => openQuickAdd('schedule')}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition"
                title="Tambah Agenda untuk tanggal ini"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of schedules on selected date */}
            <div className="mt-4 space-y-3">
              {selectedSchedules.length === 0 && selectedTasks.length === 0 && selectedReminders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada agenda, tugas, atau reminder pada tanggal ini.
                </div>
              ) : (
                <>
                  {/* Agendas */}
                  {selectedSchedules.map(sch => (
                    <div
                      key={sch.id}
                      className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                          ⏰ {sch.startTime} – {sch.endTime} WIB
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteSchedule(sch.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Hapus Agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {sch.title}
                      </h5>

                      {sch.location && (
                        <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{sch.location}</span>
                        </p>
                      )}

                      {sch.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          {sch.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {sch.category}
                        </span>
                        {sch.recurring !== 'none' && (
                          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <Repeat className="w-3 h-3" /> Berulang ({sch.recurring})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Tasks due on selected date */}
                  {selectedTasks.map(tsk => (
                    <div
                      key={tsk.id}
                      className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-1">
                        <span>⚠️ Deadline Tugas</span>
                        <span>{tsk.deadline.includes('T') ? tsk.deadline.split('T')[1].substring(0, 5) : '17:00'} WIB</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {tsk.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Status: {tsk.status}
                      </div>
                    </div>
                  ))}

                  {/* Reminders on selected date */}
                  {selectedReminders.map(rem => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                        <span>🔔 Pengingat</span>
                        <span>{rem.time} WIB</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {rem.title}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
