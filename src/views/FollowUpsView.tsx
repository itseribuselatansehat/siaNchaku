import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
} from 'lucide-react';
import { FollowUpItem } from '../types';

export const FollowUpsView: React.FC = () => {
  const { followUps, updateFollowUp, deleteFollowUp, openQuickAdd } = useApp();

  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpItem | null>(null);

  const statuses: FollowUpItem['status'][] = [
    'Perlu Dihubungi Lagi',
    'Menunggu Tanggapan',
    'Sedang Berjalan',
    'Selesai',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Tindak Lanjut (Follow Up)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau pekerjaan yang bergantung pada pihak lain, dokumen antardinas, atau janji temu
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('followup')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Follow Up</span>
        </button>
      </div>

      {/* Follow Ups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followUps.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Belum ada daftar follow up. Tambahkan pekerjaan yang memerlukan tindak lanjut.
          </div>
        ) : (
          followUps.map(item => {
            const isDone = item.status === 'Selesai';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs flex flex-col justify-between ${
                  isDone
                    ? 'border-slate-200/60 dark:border-slate-800 opacity-70 bg-slate-50/50 dark:bg-slate-900/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Perlu Dihubungi Lagi'
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                          : item.status === 'Menunggu Tanggapan'
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                          : item.status === 'Sedang Berjalan'
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Batas: {item.deadline}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>PIC: {item.pic}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {item.notes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <select
                    value={item.status}
                    onChange={e =>
                      updateFollowUp(item.id, { status: e.target.value as FollowUpItem['status'] })
                    }
                    className="text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingFollowUp(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFollowUp(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Follow Up Modal */}
      {editingFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Follow Up
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Pekerjaan / Hal yang Di-follow Up
              </label>
              <input
                type="text"
                value={editingFollowUp.title}
                onChange={e => setEditingFollowUp({ ...editingFollowUp, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Dengan Siapa (PIC)
              </label>
              <input
                type="text"
                value={editingFollowUp.pic}
                onChange={e => setEditingFollowUp({ ...editingFollowUp, pic: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Catatan Terakhir
              </label>
              <textarea
                rows={3}
                value={editingFollowUp.notes}
                onChange={e => setEditingFollowUp({ ...editingFollowUp, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingFollowUp(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updateFollowUp(editingFollowUp.id, editingFollowUp);
                  setEditingFollowUp(null);
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
