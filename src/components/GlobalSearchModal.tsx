import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  X,
  CheckSquare,
  Calendar,
  FileText,
  Bell,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    schedules,
    notes,
    reminders,
    followUps,
    toggleTaskStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'task' | 'schedule' | 'note' | 'reminder' | 'followup'>('all');

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'task' | 'schedule' | 'note' | 'reminder' | 'followup';
      date?: string;
      meta?: string;
      raw: any;
    }> = [];

    // Search Tasks
    if (selectedFilter === 'all' || selectedFilter === 'task') {
      tasks.forEach(t => {
        if (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
        ) {
          results.push({
            id: t.id,
            title: t.title,
            subtitle: t.description || `Kategori: ${t.category}`,
            type: 'task',
            date: t.deadline.split('T')[0],
            meta: `Status: ${t.status} • Prioritas: ${t.priority}`,
            raw: t,
          });
        }
      });
    }

    // Search Schedules
    if (selectedFilter === 'all' || selectedFilter === 'schedule') {
      schedules.forEach(s => {
        if (
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        ) {
          results.push({
            id: s.id,
            title: s.title,
            subtitle: s.location ? `📍 ${s.location}` : s.description,
            type: 'schedule',
            date: `${s.date} (${s.startTime} - ${s.endTime})`,
            meta: `Kategori: ${s.category}`,
            raw: s,
          });
        }
      });
    }

    // Search Notes
    if (selectedFilter === 'all' || selectedFilter === 'note') {
      notes.forEach(n => {
        if (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some(tag => tag.toLowerCase().includes(q))
        ) {
          results.push({
            id: n.id,
            title: n.title,
            subtitle: n.content.substring(0, 100),
            type: 'note',
            date: `${n.date} ${n.time}`,
            meta: `Tag: ${n.tags.join(', ')}`,
            raw: n,
          });
        }
      });
    }

    // Search Reminders
    if (selectedFilter === 'all' || selectedFilter === 'reminder') {
      reminders.forEach(r => {
        if (r.title.toLowerCase().includes(q)) {
          results.push({
            id: r.id,
            title: r.title,
            subtitle: `Pengingat status: ${r.status}`,
            type: 'reminder',
            date: `${r.date} ${r.time}`,
            meta: `Pengulangan: ${r.recurring}`,
            raw: r,
          });
        }
      });
    }

    // Search Follow Ups
    if (selectedFilter === 'all' || selectedFilter === 'followup') {
      followUps.forEach(f => {
        if (
          f.title.toLowerCase().includes(q) ||
          f.pic.toLowerCase().includes(q) ||
          f.notes.toLowerCase().includes(q)
        ) {
          results.push({
            id: f.id,
            title: f.title,
            subtitle: `PIC: ${f.pic} • ${f.notes}`,
            type: 'followup',
            date: `Batas: ${f.deadline}`,
            meta: `Status: ${f.status}`,
            raw: f,
          });
        }
      });
    }

    return results;
  }, [searchQuery, selectedFilter, tasks, schedules, notes, reminders, followUps]);

  if (!isSearchOpen) return null;

  const handleSelectResult = (item: any) => {
    setIsSearchOpen(false);
    if (item.type === 'task') onNavigateTab('tasks');
    else if (item.type === 'schedule') onNavigateTab('schedules');
    else if (item.type === 'note') onNavigateTab('notes');
    else if (item.type === 'reminder') onNavigateTab('reminders');
    else if (item.type === 'followup') onNavigateTab('followups');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Search input field */}
        <div className="relative flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari agenda, tugas, catatan, pengingat, atau follow up..."
            className="w-full px-3 py-1.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] px-2 py-0.5 ml-2 font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 ml-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter:</span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'task', label: 'Tugas' },
            { id: 'schedule', label: 'Agenda' },
            { id: 'note', label: 'Catatan' },
            { id: 'reminder', label: 'Reminder' },
            { id: 'followup', label: 'Follow Up' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800">
          {!searchQuery.trim() ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                Mulai ketik kata kunci yang ingin Anda cari
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Contoh: "laporan", "rapat", "Andi", "tagihan", "evaluasi"
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ditemukan hasil untuk "{searchQuery}".
            </div>
          ) : (
            filteredResults.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item)}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer flex items-start gap-3 group"
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    item.type === 'task'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      : item.type === 'schedule'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                      : item.type === 'note'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                      : item.type === 'followup'
                      ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                  }`}
                >
                  {item.type === 'task' && <CheckSquare className="w-4 h-4" />}
                  {item.type === 'schedule' && <Calendar className="w-4 h-4" />}
                  {item.type === 'note' && <FileText className="w-4 h-4" />}
                  {item.type === 'reminder' && <Bell className="w-4 h-4" />}
                  {item.type === 'followup' && <UserCheck className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                      {item.title}
                    </h4>
                    {item.date && (
                      <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                        {item.date}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                  {item.meta && (
                    <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                      {item.meta}
                    </span>
                  )}
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition shrink-0 mt-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
