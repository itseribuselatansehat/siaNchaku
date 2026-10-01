import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Plus,
  List,
  Kanban,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { TaskItem, TaskStatus, Priority, Category } from '../types';

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskChecklist,
    toggleTaskStatus,
    openQuickAdd,
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal for editing task
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const kanbanColumns: TaskStatus[] = [
    'Belum dimulai',
    'Sedang dikerjakan',
    'Menunggu',
    'Selesai',
    'Ditunda',
  ];

  const handleAddChecklistItem = (taskId: string) => {
    if (!newChecklistText.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      done: false,
    };

    updateTask(taskId, {
      checklist: [...task.checklist, newItem],
    });
    setNewChecklistText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Tugas Saya</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola daftar pekerjaan, prioritas, deadline, dan checklist pencapaian
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => openQuickAdd('task')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari tugas berdasarkan judul atau catatan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">Semua Status</option>
          <option value="Belum dimulai">Belum dimulai</option>
          <option value="Sedang dikerjakan">Sedang dikerjakan</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditunda">Ditunda</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">Semua Prioritas</option>
          <option value="Tinggi">🔴 Tinggi</option>
          <option value="Sedang">🟡 Sedang</option>
          <option value="Rendah">🟢 Rendah</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">Semua Kategori</option>
          <option value="Pekerjaan">Pekerjaan</option>
          <option value="Pribadi">Pribadi</option>
          <option value="Rapat">Rapat</option>
          <option value="Keuangan">Keuangan</option>
          <option value="Ide">Ide</option>
          <option value="Follow Up">Follow Up</option>
        </select>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Tidak ada tugas yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isDone = task.status === 'Selesai';
              const checklistDoneCount = task.checklist.filter(c => c.done).length;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs ${
                    isDone
                      ? 'border-slate-200/60 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority Pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.priority === 'Tinggi'
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                : task.priority === 'Sedang'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {task.priority === 'Tinggi' ? '🔴' : task.priority === 'Sedang' ? '🟡' : '🟢'} {task.priority}
                          </span>

                          {/* Status Pill */}
                          <select
                            value={task.status}
                            onChange={e => toggleTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            <option value="Belum dimulai">Belum dimulai</option>
                            <option value="Sedang dikerjakan">Sedang dikerjakan</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditunda">Ditunda</option>
                          </select>

                          {/* Category */}
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {task.category}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Checklist Preview */}
                        {task.checklist.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                              <span>Checklist ({checklistDoneCount}/{task.checklist.length})</span>
                            </div>
                            <div className="space-y-1 pl-1">
                              {task.checklist.map(c => (
                                <label
                                  key={c.id}
                                  className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={c.done}
                                    onChange={() => toggleTaskChecklist(task.id, c.id)}
                                    className="rounded text-indigo-600 focus:ring-0"
                                  />
                                  <span className={c.done ? 'line-through text-slate-400' : ''}>
                                    {c.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes if any */}
                        {task.notes && (
                          <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            Catatan: {task.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions & Deadline */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          📅 {task.deadline.replace('T', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Tugas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(status => {
            const colTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div
                key={status}
                className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex flex-col min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {status}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400">
                      Kosong
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              task.priority === 'Tinggi'
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                : task.priority === 'Sedang'
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.deadline.split('T')[0]}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {task.title}
                        </h5>

                        {task.checklist.length > 0 && (
                          <div className="text-[10px] text-slate-400 mb-2">
                            Checklist: {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <select
                            value={task.status}
                            onChange={e => toggleTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="text-[10px] bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-600"
                          >
                            {kanbanColumns.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 text-slate-400 hover:text-indigo-500"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. CALENDAR TIMELINE VIEW */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Batas Waktu (Deadline) Tugas Berdasarkan Tanggal
          </h3>

          <div className="space-y-4">
            {Object.entries(
              filteredTasks.reduce((acc, t) => {
                const dateKey = t.deadline.split('T')[0];
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(t);
                return acc;
              }, {} as Record<string, TaskItem[]>)
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, groupTasks]) => (
                <div key={dateKey} className="border-l-2 border-indigo-500 pl-4 py-1 space-y-2">
                  <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {new Date(dateKey).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="space-y-2">
                    {groupTasks.map(t => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTaskStatus(t.id)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              t.status === 'Selesai'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-400'
                            }`}
                          >
                            {t.status === 'Selesai' && <Check className="w-3 h-3" />}
                          </button>
                          <span
                            className={
                              t.status === 'Selesai'
                                ? 'line-through text-slate-400'
                                : 'font-bold text-slate-800 dark:text-slate-100'
                            }
                          >
                            {t.title}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500">
                          {t.deadline.includes('T') ? t.deadline.split('T')[1].substring(0, 5) : '17:00'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Tugas
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Judul Tugas
              </label>
              <input
                type="text"
                value={editingTask.title}
                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={editingTask.description}
                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Checklist management */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Checklist Pekerjaan
              </label>
              <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                {editingTask.checklist.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className={c.done ? 'line-through text-slate-400' : ''}>{c.text}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTask({
                          ...editingTask,
                          checklist: editingTask.checklist.filter(item => item.id !== c.id),
                        })
                      }
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  placeholder="Tambah butir checklist baru..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newChecklistText.trim()) {
                      setEditingTask({
                        ...editingTask,
                        checklist: [
                          ...editingTask.checklist,
                          { id: 'chk-' + Date.now(), text: newChecklistText.trim(), done: false },
                        ],
                      });
                      setNewChecklistText('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateTask(editingTask.id, editingTask);
                  setEditingTask(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
