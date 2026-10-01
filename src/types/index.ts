export type Priority = 'Tinggi' | 'Sedang' | 'Rendah';

export type TaskStatus = 'Belum dimulai' | 'Sedang dikerjakan' | 'Menunggu' | 'Selesai' | 'Ditunda';

export type Category = 'Pekerjaan' | 'Pribadi' | 'Rapat' | 'Keuangan' | 'Ide' | 'Follow Up' | 'Lainnya';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'workdays' | 'custom';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  priority: Priority;
  status: TaskStatus;
  category: Category;
  reminderMinutes: number; // e.g. 30 min before
  checklist: TaskChecklistItem[];
  notes: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  description: string;
  category: Category;
  priority: Priority;
  reminderMinutes: number;
  recurring: RecurrenceType;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  content: string;
  category: Category;
  priority: Priority;
  tags: string[];
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'agenda' | 'task' | 'deadline' | 'followup' | 'custom';
  recurring: RecurrenceType;
  status: 'pending' | 'triggered' | 'dismissed' | 'snoozed';
  targetId?: string; // id of referenced task or schedule
  triggeredAt?: string;
  createdAt: string;
}

export interface FollowUpItem {
  id: string;
  title: string;
  pic: string;
  lastContactDate: string; // YYYY-MM-DD
  notes: string;
  deadline: string; // YYYY-MM-DD
  status: 'Menunggu Tanggapan' | 'Sedang Berjalan' | 'Perlu Dihubungi Lagi' | 'Selesai';
  reminderTime?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  title: string;
  description: string;
  category: 'task' | 'schedule' | 'reminder' | 'note' | 'followup' | 'system';
  timestamp: string; // ISO string
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatar: string;
  workStart: string; // "08:00"
  workEnd: string; // "17:00"
  workDays: number[]; // [1,2,3,4,5] (Monday to Friday)
  timezone: string; // "Asia/Jakarta (GMT+7)"
  morningBriefingTime: string; // "07:30"
  eveningReviewTime: string; // "18:00"
  defaultReminderMinutes: number; // 30
  soundEnabled: boolean;
  webPushEnabled: boolean;
  theme: 'dark' | 'light';
  gasWebhookUrl?: string;
  lastBriefingDate?: string;
  lastReviewDate?: string;
}

export interface ActiveAlert {
  id: string;
  title: string;
  message: string;
  type: 'agenda' | 'deadline' | 'reminder' | 'followup';
  timestamp: string;
  urgency: 'high' | 'medium' | 'normal';
}
