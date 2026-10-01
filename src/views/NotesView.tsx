import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Plus,
  Search,
  Tag,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NoteItem, Category, Priority } from '../types';
import { getTodayDateString } from '../data/initialData';

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, openQuickAdd } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const categories: Category[] = [
    'Pekerjaan',
    'Pribadi',
    'Rapat',
    'Keuangan',
    'Ide',
    'Follow Up',
    'Lainnya',
  ];

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || n.category === selectedCategory;
      const matchDate = !selectedDateFilter || n.date === selectedDateFilter;

      return matchSearch && matchCategory && matchDate;
    });
  }, [notes, searchQuery, selectedCategory, selectedDateFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Catatan Harian</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dokumentasikan apa yang dikerjakan, hasil pekerjaan, kendala, notula rapat, dan ide
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('note')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Catatan</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari catatan, hasil rapat, atau ide..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date Filter */}
        <input
          type="date"
          value={selectedDateFilter}
          onChange={e => setSelectedDateFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        />
        {selectedDateFilter && (
          <button
            onClick={() => setSelectedDateFilter('')}
            className="text-xs text-indigo-600 hover:underline"
          >
            Reset Tanggal
          </button>
        )}

        {/* Category Pills */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
                selectedCategory === c
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Belum ada catatan yang sesuai dengan pencarian.
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-purple-500/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                    <span>•</span>
                    <span>{note.time}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed line-clamp-6">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Catatan Harian
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Judul Catatan
              </label>
              <input
                type="text"
                value={editingNote.title}
                onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Isi Catatan
              </label>
              <textarea
                rows={5}
                value={editingNote.content}
                onChange={e => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateNote(editingNote.id, editingNote);
                  setEditingNote(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
