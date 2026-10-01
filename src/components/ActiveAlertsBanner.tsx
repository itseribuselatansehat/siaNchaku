import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, AlertTriangle, Clock, X, Check } from 'lucide-react';

export const ActiveAlertsBanner: React.FC = () => {
  const { activeAlerts, dismissAlert, snoozeReminder } = useApp();

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`pointer-events-auto rounded-xl p-4 shadow-xl border backdrop-blur-md transition-all animate-bounce-subtle flex items-start gap-3 ${
            alert.urgency === 'high'
              ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              : 'bg-indigo-50/95 dark:bg-indigo-950/90 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              alert.urgency === 'high'
                ? 'bg-rose-500 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {alert.type === 'deadline' ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
              <Bell className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm tracking-tight">{alert.title}</h4>
              <span className="text-xs opacity-75 font-mono">{alert.timestamp} WIB</span>
            </div>
            <p className="text-xs mt-1 leading-relaxed line-clamp-2 opacity-90">
              {alert.message}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => dismissAlert(alert.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/80 dark:bg-slate-800 border border-current/20 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" /> Mengerti
              </button>
              {alert.type !== 'deadline' && (
                <button
                  onClick={() => {
                    const remId = alert.id.replace('alert-', '').split('-')[0];
                    if (remId) snoozeReminder(remId, 10);
                    dismissAlert(alert.id);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" /> Tunda 10m
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="p-1 rounded-md text-current opacity-60 hover:opacity-100 transition hover:bg-black/5 dark:hover:bg-white/5"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
