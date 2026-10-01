import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  UserProfile,
  TaskItem,
  ScheduleItem,
  NoteItem,
  ReminderItem,
  FollowUpItem,
  ActivityLogItem,
  ActiveAlert,
  TaskStatus,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_TASKS,
  INITIAL_SCHEDULES,
  INITIAL_NOTES,
  INITIAL_REMINDERS,
  INITIAL_FOLLOWUPS,
  INITIAL_ACTIVITIES,
  getTodayDateString,
  getTomorrowDateString,
} from '../data/initialData';
import { soundAndNotify } from '../utils/soundAndNotification';

interface AppContextType {
  user: UserProfile;
  tasks: TaskItem[];
  schedules: ScheduleItem[];
  notes: NoteItem[];
  reminders: ReminderItem[];
  followUps: FollowUpItem[];
  activities: ActivityLogItem[];
  activeAlerts: ActiveAlert[];
  dismissAlert: (id: string) => void;
  
  // Modals & Panels
  isMorningBriefingOpen: boolean;
  setIsMorningBriefingOpen: (open: boolean) => void;
  isEveningReviewOpen: boolean;
  setIsEveningReviewOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickAddType: 'task' | 'schedule' | 'note' | 'reminder' | 'followup';
  setQuickAddType: (type: 'task' | 'schedule' | 'note' | 'reminder' | 'followup') => void;
  openQuickAdd: (type?: 'task' | 'schedule' | 'note' | 'reminder' | 'followup') => void;

  // Actions
  updateUser: (updates: Partial<UserProfile>) => void;
  
  // Task Actions
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTaskChecklist: (taskId: string, checklistId: string) => void;
  toggleTaskStatus: (id: string, status?: TaskStatus) => void;
  rollOverPendingTasksToTomorrow: () => number;
  
  // Schedule Actions
  addSchedule: (sch: Omit<ScheduleItem, 'id' | 'createdAt'>) => ScheduleItem;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;

  // Note Actions
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => NoteItem;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  // Reminder Actions
  addReminder: (rem: Omit<ReminderItem, 'id' | 'createdAt'>) => ReminderItem;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes?: number) => void;

  // Follow Up Actions
  addFollowUp: (flw: Omit<FollowUpItem, 'id' | 'createdAt'>) => FollowUpItem;
  updateFollowUp: (id: string, updates: Partial<FollowUpItem>) => void;
  deleteFollowUp: (id: string) => void;

  // Log
  addActivity: (title: string, description: string, category: ActivityLogItem['category']) => void;

  // Sync & Backup
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  syncWithGas: () => Promise<{ success: boolean; message: string }>;
  resetToDefaults: () => void;
  
  // Computed stats
  todayStats: {
    agendaCount: number;
    tasksTotal: number;
    tasksCompleted: number;
    tasksPending: number;
    deadlinesTodayCount: number;
    remindersTodayCount: number;
    urgentCount: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'asistenku_user_v2',
  TASKS: 'asistenku_tasks_v2',
  SCHEDULES: 'asistenku_schedules_v2',
  NOTES: 'asistenku_notes_v2',
  REMINDERS: 'asistenku_reminders_v2',
  FOLLOWUPS: 'asistenku_followups_v2',
  ACTIVITIES: 'asistenku_activities_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state with fallback to defaults
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
      return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS;
    } catch {
      return INITIAL_FOLLOWUPS;
    }
  });

  const [activities, setActivities] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isMorningBriefingOpen, setIsMorningBriefingOpen] = useState(false);
  const [isEveningReviewOpen, setIsEveningReviewOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'schedule' | 'note' | 'reminder' | 'followup'>('task');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followUps));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [followUps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [activities]);

  // Apply dark mode class to html document
  useEffect(() => {
    const root = document.documentElement;
    if (user.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user.theme]);

  // Keyboard shortcut listener for global search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to add activity
  const addActivity = (title: string, description: string, category: ActivityLogItem['category']) => {
    const newAct: ActivityLogItem = {
      id: 'ACT-' + Date.now(),
      title,
      description,
      category,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    addActivity('Pengaturan Diperbarui', 'Profil dan preferensi akun diperbarui', 'system');
  };

  const openQuickAdd = (type: 'task' | 'schedule' | 'note' | 'reminder' | 'followup' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // Task methods
  const addTask = (item: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>): TaskItem => {
    const nowIso = new Date().toISOString();
    const newTask: TaskItem = {
      ...item,
      id: 'TSK-' + Date.now(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setTasks(prev => [newTask, ...prev]);
    addActivity('Tugas Dibuat', `Menambahkan tugas: "${newTask.title}"`, 'task');

    // Also auto-create a reminder if reminderMinutes is set and deadline exists
    if (newTask.deadline && newTask.reminderMinutes > 0) {
      try {
        const deadlineDate = new Date(newTask.deadline);
        const remTime = new Date(deadlineDate.getTime() - newTask.reminderMinutes * 60000);
        const dateStr = remTime.toISOString().split('T')[0];
        const timeStr = remTime.toTimeString().substring(0, 5);
        addReminder({
          title: `Deadline Tugas: ${newTask.title}`,
          date: dateStr,
          time: timeStr,
          type: 'deadline',
          recurring: 'none',
          status: 'pending',
          targetId: newTask.id,
        });
      } catch (e) {
        console.warn('Auto reminder schedule error:', e);
      }
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    addActivity('Tugas Diperbarui', `Memperbarui tugas #${id.slice(-4)}`, 'task');
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (taskToDelete) {
      addActivity('Tugas Dihapus', `Menghapus tugas: "${taskToDelete.title}"`, 'task');
    }
  };

  const toggleTaskChecklist = (taskId: string, checklistId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map(c =>
          c.id === checklistId ? { ...c, done: !c.done } : c
        );
        return { ...t, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
      })
    );
  };

  const toggleTaskStatus = (id: string, customStatus?: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        let newStatus: TaskStatus = customStatus || (t.status === 'Selesai' ? 'Belum dimulai' : 'Selesai');
        const isNowCompleted = newStatus === 'Selesai';
        if (isNowCompleted && user.soundEnabled) {
          soundAndNotify.playChime('success');
        }
        return {
          ...t,
          status: newStatus,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const rollOverPendingTasksToTomorrow = (): number => {
    const todayStr = getTodayDateString();
    const tomorrowStr = getTomorrowDateString();
    let count = 0;

    setTasks(prev =>
      prev.map(t => {
        if (t.status !== 'Selesai') {
          // If deadline is today or past, move to tomorrow
          const taskDate = t.deadline.split('T')[0];
          if (taskDate <= todayStr) {
            count++;
            const timePart = t.deadline.includes('T') ? t.deadline.split('T')[1] : '17:00';
            return {
              ...t,
              deadline: `${tomorrowStr}T${timePart}`,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return t;
      })
    );

    if (count > 0) {
      addActivity(
        'Tugas Dipindahkan',
        `${count} tugas belum selesai dipindahkan ke besok (${tomorrowStr})`,
        'task'
      );
    }
    return count;
  };

  // Schedule methods
  const addSchedule = (sch: Omit<ScheduleItem, 'id' | 'createdAt'>): ScheduleItem => {
    const newSch: ScheduleItem = {
      ...sch,
      id: 'SCH-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSchedules(prev => [newSch, ...prev]);
    addActivity('Agenda Dibuat', `Menjadwalkan agenda: "${newSch.title}"`, 'schedule');

    // Also auto-create a reminder before the schedule
    if (newSch.date && newSch.startTime && newSch.reminderMinutes > 0) {
      try {
        const [h, m] = newSch.startTime.split(':').map(Number);
        const schDateTime = new Date(`${newSch.date}T${newSch.startTime}:00`);
        const remTime = new Date(schDateTime.getTime() - newSch.reminderMinutes * 60000);
        const rDate = remTime.toISOString().split('T')[0];
        const rTime = remTime.toTimeString().substring(0, 5);

        addReminder({
          title: `Agenda: ${newSch.title} (${newSch.startTime})`,
          date: rDate,
          time: rTime,
          type: 'agenda',
          recurring: newSch.recurring,
          status: 'pending',
          targetId: newSch.id,
        });
      } catch (err) {
        console.warn('Auto schedule reminder error:', err);
      }
    }

    return newSch;
  };

  const updateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    addActivity('Agenda Diperbarui', `Memperbarui jadwal #${id.slice(-4)}`, 'schedule');
  };

  const deleteSchedule = (id: string) => {
    const item = schedules.find(s => s.id === id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    if (item) {
      addActivity('Agenda Dihapus', `Menghapus agenda: "${item.title}"`, 'schedule');
    }
  };

  // Note methods
  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt'>): NoteItem => {
    const newNote: NoteItem = {
      ...note,
      id: 'NOT-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    addActivity('Catatan Ditambahkan', `Membuat catatan: "${newNote.title}"`, 'note');
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
    addActivity('Catatan Diperbarui', `Memperbarui catatan #${id.slice(-4)}`, 'note');
  };

  const deleteNote = (id: string) => {
    const item = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (item) {
      addActivity('Catatan Dihapus', `Menghapus catatan: "${item.title}"`, 'note');
    }
  };

  // Reminder methods
  const addReminder = (rem: Omit<ReminderItem, 'id' | 'createdAt'>): ReminderItem => {
    const newRem: ReminderItem = {
      ...rem,
      id: 'REM-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [newRem, ...prev]);
    addActivity('Pengingat Disetel', `Menyetel pengingat: "${newRem.title}" pada ${newRem.time}`, 'reminder');
    return newRem;
  };

  const updateReminder = (id: string, updates: Partial<ReminderItem>) => {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteReminder = (id: string) => {
    const item = reminders.find(r => r.id === id);
    setReminders(prev => prev.filter(r => r.id !== id));
    if (item) {
      addActivity('Pengingat Dihapus', `Menghapus pengingat: "${item.title}"`, 'reminder');
    }
  };

  const dismissReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'dismissed' } : r))
    );
  };

  const snoozeReminder = (id: string, minutes = 10) => {
    const now = new Date(Date.now() + minutes * 60000);
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    setReminders(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              date: dateStr,
              time: timeStr,
              status: 'pending',
              triggeredAt: undefined,
            }
          : r
      )
    );
    addActivity('Pengingat Ditunda', `Menunda pengingat ${minutes} menit`, 'reminder');
  };

  // Follow up methods
  const addFollowUp = (flw: Omit<FollowUpItem, 'id' | 'createdAt'>): FollowUpItem => {
    const newFlw: FollowUpItem = {
      ...flw,
      id: 'FLW-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFollowUps(prev => [newFlw, ...prev]);
    addActivity('Follow Up Dibuat', `Menambahkan follow up: "${newFlw.title}" dengan ${newFlw.pic}`, 'followup');
    return newFlw;
  };

  const updateFollowUp = (id: string, updates: Partial<FollowUpItem>) => {
    setFollowUps(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    addActivity('Follow Up Diperbarui', `Memperbarui follow up #${id.slice(-4)}`, 'followup');
  };

  const deleteFollowUp = (id: string) => {
    const item = followUps.find(f => f.id === id);
    setFollowUps(prev => prev.filter(f => f.id !== id));
    if (item) {
      addActivity('Follow Up Dihapus', `Menghapus follow up: "${item.title}"`, 'followup');
    }
  };

  const dismissAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // --- Real-Time Reminder Engine ---
  // Runs every 10 seconds to check due reminders and deadlines
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const nowDateStr = now.toISOString().split('T')[0];
      const nowHours = String(now.getHours()).padStart(2, '0');
      const nowMins = String(now.getMinutes()).padStart(2, '0');
      const nowTimeStr = `${nowHours}:${nowMins}`;

      // 1. Check Reminders
      reminders.forEach(rem => {
        if (rem.status === 'pending') {
          // If reminder date matches today and time is now or slightly passed within 5 mins
          if (rem.date === nowDateStr && rem.time <= nowTimeStr) {
            // Trigger alert!
            const alertId = 'alert-' + rem.id + '-' + Date.now();
            setActiveAlerts(prev => {
              if (prev.some(a => a.id.startsWith('alert-' + rem.id))) return prev;
              return [
                {
                  id: alertId,
                  title: '🔔 Pengingat SiaNcaku',
                  message: rem.title,
                  type: rem.type === 'deadline' ? 'deadline' : 'reminder',
                  timestamp: nowTimeStr,
                  urgency: rem.type === 'deadline' ? 'high' : 'medium',
                },
                ...prev,
              ];
            });

            if (user.soundEnabled) {
              soundAndNotify.playChime(rem.type === 'deadline' ? 'deadline' : 'reminder');
            }
            soundAndNotify.showWebNotification('🔔 SiaNcaku: Pengingat', rem.title);

            // Handle recurring or mark triggered
            if (rem.recurring && rem.recurring !== 'none') {
              const d = new Date(`${rem.date}T12:00:00`);
              if (rem.recurring === 'daily') d.setDate(d.getDate() + 1);
              else if (rem.recurring === 'weekly') d.setDate(d.getDate() + 7);
              else if (rem.recurring === 'monthly') d.setMonth(d.getMonth() + 1);
              else d.setDate(d.getDate() + 1);

              const nextDateStr = d.toISOString().split('T')[0];
              updateReminder(rem.id, {
                date: nextDateStr,
                status: 'pending',
                triggeredAt: new Date().toISOString(),
              });
            } else {
              updateReminder(rem.id, {
                status: 'triggered',
                triggeredAt: new Date().toISOString(),
              });
            }

            addActivity('Pengingat Berbunyi', `Pengingat aktif: "${rem.title}"`, 'reminder');
          }
        }
      });

      // 2. Check Overdue Tasks with today's deadline
      tasks.forEach(tsk => {
        if (tsk.status !== 'Selesai' && tsk.deadline) {
          const taskDate = tsk.deadline.split('T')[0];
          const taskTime = tsk.deadline.includes('T') ? tsk.deadline.split('T')[1].substring(0, 5) : '23:59';

          if (taskDate === nowDateStr && taskTime <= nowTimeStr) {
            // Has it been alerted?
            const alertKey = 'task-deadline-' + tsk.id;
            setActiveAlerts(prev => {
              if (prev.some(a => a.id === alertKey)) return prev;
              if (user.soundEnabled) soundAndNotify.playChime('deadline');
              soundAndNotify.showWebNotification(
                '⚠️ Deadline Tugas Tiba',
                `Tugas "${tsk.title}" mencapai batas waktu pukul ${taskTime}.`
              );
              return [
                {
                  id: alertKey,
                  title: '⚠️ Deadline Pekerjaan Belum Selesai',
                  message: `Tugas "${tsk.title}" belum selesai. Batas waktu hari ini pukul ${taskTime}.`,
                  type: 'deadline',
                  timestamp: nowTimeStr,
                  urgency: 'high',
                },
                ...prev,
              ];
            });
          }
        }
      });
    }, 10000);

    return () => clearInterval(checkInterval);
  }, [reminders, tasks, user.soundEnabled]);

  // Morning briefing check: if before 11:30 AM and hasn't shown today
  useEffect(() => {
    const todayStr = getTodayDateString();
    const currentHour = new Date().getHours();
    if (currentHour < 12 && user.lastBriefingDate !== todayStr) {
      const timer = setTimeout(() => {
        setIsMorningBriefingOpen(true);
        setUser(prev => ({ ...prev, lastBriefingDate: todayStr }));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user.lastBriefingDate]);

  // Computed summary stats for dashboard
  const todayStats = useMemo(() => {
    const todayStr = getTodayDateString();
    const todaySchedules = schedules.filter(s => s.date === todayStr);
    const todayTasks = tasks.filter(t => t.deadline.startsWith(todayStr));
    const completedTasks = todayTasks.filter(t => t.status === 'Selesai');
    const pendingTasks = todayTasks.filter(t => t.status !== 'Selesai');
    const todayReminders = reminders.filter(r => r.date === todayStr);
    const urgentCount = tasks.filter(
      t => t.status !== 'Selesai' && t.priority === 'Tinggi' && t.deadline.split('T')[0] <= todayStr
    ).length;

    return {
      agendaCount: todaySchedules.length,
      tasksTotal: todayTasks.length,
      tasksCompleted: completedTasks.length,
      tasksPending: pendingTasks.length,
      deadlinesTodayCount: todayTasks.length,
      remindersTodayCount: todayReminders.length,
      urgentCount,
    };
  }, [schedules, tasks, reminders]);

  // Export JSON
  const exportDataJson = (): string => {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user,
      tasks,
      schedules,
      notes,
      reminders,
      followUps,
      activities,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  // Import JSON
  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.schedules && Array.isArray(parsed.schedules)) setSchedules(parsed.schedules);
      if (parsed.notes && Array.isArray(parsed.notes)) setNotes(parsed.notes);
      if (parsed.reminders && Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
      if (parsed.followUps && Array.isArray(parsed.followUps)) setFollowUps(parsed.followUps);
      if (parsed.user) setUser(prev => ({ ...prev, ...parsed.user }));
      addActivity('Impor Data', 'Memulihkan data dari berkas cadangan JSON', 'system');
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  // Sync with Google Apps Script Web App
  const syncWithGas = async (): Promise<{ success: boolean; message: string }> => {
    if (!user.gasWebhookUrl) {
      return {
        success: false,
        message: 'URL Web App Google Apps Script belum dimasukkan di menu Integrasi Google Sheets.',
      };
    }

    try {
      const payload = {
        action: 'syncAll',
        userId: user.id,
        data: {
          USERS: [
            {
              ID: user.id,
              Nama: user.name,
              Email: user.email,
              Foto: user.avatar,
              CreatedAt: new Date().toISOString(),
            },
          ],
          TASKS: tasks.map(t => ({
            ID: t.id,
            UserID: user.id,
            Judul: t.title,
            Deskripsi: t.description,
            Deadline: t.deadline,
            Prioritas: t.priority,
            Status: t.status,
            Kategori: t.category,
            Reminder: t.reminderMinutes,
            CreatedAt: t.createdAt,
            UpdatedAt: t.updatedAt,
          })),
          SCHEDULES: schedules.map(s => ({
            ID: s.id,
            UserID: user.id,
            Judul: s.title,
            Tanggal: s.date,
            WaktuMulai: s.startTime,
            WaktuSelesai: s.endTime,
            Lokasi: s.location,
            Deskripsi: s.description,
            Reminder: s.reminderMinutes,
            Recurring: s.recurring,
            CreatedAt: s.createdAt,
          })),
          NOTES: notes.map(n => ({
            ID: n.id,
            UserID: user.id,
            Tanggal: n.date,
            Jam: n.time,
            Judul: n.title,
            Isi: n.content,
            Kategori: n.category,
            CreatedAt: n.createdAt,
          })),
          REMINDERS: reminders.map(r => ({
            ID: r.id,
            UserID: user.id,
            Judul: r.title,
            Tanggal: r.date,
            Waktu: r.time,
            Tipe: r.type,
            Recurring: r.recurring,
            Status: r.status,
            CreatedAt: r.createdAt,
          })),
          FOLLOWUPS: followUps.map(f => ({
            ID: f.id,
            UserID: user.id,
            Judul: f.title,
            PIC: f.pic,
            Deskripsi: f.notes,
            Deadline: f.deadline,
            Status: f.status,
            Reminder: f.reminderTime || '',
            CreatedAt: f.createdAt,
          })),
        },
      };

      const res = await fetch(user.gasWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors', // standard GAS redirect handling
      });

      addActivity('Sinkronisasi Google Sheets', 'Data berhasil disinkronkan ke spreadsheet', 'system');
      return { success: true, message: 'Data berhasil disinkronkan ke Google Spreadsheet Anda!' };
    } catch (err: any) {
      return { success: false, message: 'Gagal menghubungkan ke Google Apps Script: ' + err.message };
    }
  };

  const resetToDefaults = () => {
    setUser(INITIAL_USER);
    setTasks(INITIAL_TASKS);
    setSchedules(INITIAL_SCHEDULES);
    setNotes(INITIAL_NOTES);
    setReminders(INITIAL_REMINDERS);
    setFollowUps(INITIAL_FOLLOWUPS);
    setActivities(INITIAL_ACTIVITIES);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        tasks,
        schedules,
        notes,
        reminders,
        followUps,
        activities,
        activeAlerts,
        dismissAlert,
        isMorningBriefingOpen,
        setIsMorningBriefingOpen,
        isEveningReviewOpen,
        setIsEveningReviewOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickAddType,
        setQuickAddType,
        openQuickAdd,
        updateUser,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskChecklist,
        toggleTaskStatus,
        rollOverPendingTasksToTomorrow,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addNote,
        updateNote,
        deleteNote,
        addReminder,
        updateReminder,
        deleteReminder,
        dismissReminder,
        snoozeReminder,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        addActivity,
        exportDataJson,
        importDataJson,
        syncWithGas,
        resetToDefaults,
        todayStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
