import React from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  CheckCircle2,
  Calendar,
  Bell,
  FileText,
  UserCheck,
  Settings,
} from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activities } = useApp();

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'schedule':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'reminder':
        return <Bell className="w-4 h-4 text-amber-500" />;
      case 'note':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'followup':
        return <UserCheck className="w-4 h-4 text-cyan-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Riwayat Aktivitas</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Rekam jejak otomatis setiap pembuatan tugas, agenda, pengingat, dan catatan Anda
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map(act => (
              <div key={act.id} className="relative group flex items-start gap-4">
                {/* Bullet */}
                <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 ring-2 ring-slate-200 dark:ring-slate-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>

                <div className="flex-1 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getIcon(act.category)}
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">
                        {act.title}
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      WIB
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {new Date(act.timestamp).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
