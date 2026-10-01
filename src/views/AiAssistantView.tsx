import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  Calendar,
  CheckSquare,
  Bell,
  UserCheck,
  Check,
  Loader2,
  CornerDownLeft,
  User,
  Zap,
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parsedAction?: {
    type: 'task' | 'schedule' | 'reminder' | 'followup' | 'note';
    title: string;
    description?: string;
    date?: string;
    time?: string;
    endTime?: string;
    location?: string;
    pic?: string;
    priority?: string;
    recurring?: string;
    confirmationMessage: string;
    isExecuted?: boolean;
  };
}

export const AiAssistantView: React.FC = () => {
  const {
    user,
    addTask,
    addSchedule,
    addReminder,
    addFollowUp,
    addNote,
    todayStats,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Halo, ${user.nickname || user.name}! 👋 Saya adalah **SiaNcaku**, asisten pribadi digital yang tidak pernah lupa.
      
Anda dapat memberikan instruksi natural langsung, misalnya:
• *"Besok jam 9 ingatkan saya rapat staf"*
• *"Jumat saya harus menyelesaikan laporan bulanan"*
• *"Setiap pagi jam 8 ingatkan saya mengecek pekerjaan"*
• *"Hubungi Pak Andi lusa jam 10 terkait tanda tangan berkas"*

Ada hal penting atau pekerjaan yang ingin saya bantu catatkan sekarang?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: textToSend.trim(),
        timestamp: nowTime,
      },
    ];

    setMessages(newMessages);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const parseRes = await fetch('/api/ai/parse-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: textToSend.trim(),
          userTimezone: user.timezone,
          nowIso: new Date().toISOString(),
        }),
      });

      const parseData = await parseRes.json();
      const parsed = parseData.parsed;

      if (parsed && parsed.title && parsed.type) {
        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'assistant',
            content: parsed.confirmationMessage || 'Baik, instruksi Anda telah saya pahami:',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            parsedAction: {
              ...parsed,
              isExecuted: false,
            },
          },
        ]);
      } else {
        const chatRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            userContext: {
              userName: user.name,
              pendingTasksCount: todayStats.tasksPending,
              agendaCount: todayStats.agendaCount,
            },
          }),
        });

        const chatData = await chatRes.json();
        setMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            role: 'assistant',
            content: chatData.reply || 'Baik, saya siap membantu!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.warn('AI error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: 'Maaf, terjadi gangguan sementara saat memproses instruksi. Anda tetap dapat menggunakan menu Tambah Cepat di atas.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeParsedAction = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.parsedAction || msg.parsedAction.isExecuted) return;

    const a = msg.parsedAction;
    const today = getTodayDateString();

    if (a.type === 'task') {
      addTask({
        title: a.title,
        description: a.description || 'Dibuat via SiaNcaku AI',
        deadline: `${a.date || today}T${a.time || '17:00'}`,
        priority: (a.priority as any) || 'Tinggi',
        status: 'Belum dimulai',
        category: 'Pekerjaan',
        reminderMinutes: 30,
        checklist: [],
        notes: '',
      });
    } else if (a.type === 'schedule') {
      addSchedule({
        title: a.title,
        date: a.date || today,
        startTime: a.time || '09:00',
        endTime: a.endTime || '10:00',
        location: a.location || '',
        description: a.description || 'Dibuat via SiaNcaku AI',
        category: 'Rapat',
        priority: (a.priority as any) || 'Tinggi',
        reminderMinutes: 15,
        recurring: (a.recurring as any) || 'none',
      });
    } else if (a.type === 'followup') {
      addFollowUp({
        title: a.title,
        pic: a.pic || 'Rekan Terkait',
        lastContactDate: today,
        notes: a.description || 'Tindak lanjut via SiaNcaku AI',
        deadline: a.date || today,
        status: 'Perlu Dihubungi Lagi',
        reminderTime: a.time || '09:00',
      });
    } else if (a.type === 'note') {
      addNote({
        date: a.date || today,
        time: a.time || '09:00',
        title: a.title,
        content: a.description || a.title,
        category: 'Ide',
        priority: 'Sedang',
        tags: ['AI'],
      });
    } else {
      addReminder({
        title: a.title,
        date: a.date || today,
        time: a.time || '09:00',
        type: 'custom',
        recurring: (a.recurring as any) || 'none',
        status: 'pending',
      });
    }

    setMessages(prev =>
      prev.map(m =>
        m.id === msgId && m.parsedAction
          ? {
              ...m,
              parsedAction: { ...m.parsedAction, isExecuted: true },
            }
          : m
      )
    );
  };

  const samplePrompts = [
    'Besok jam 9 ingatkan saya rapat evaluasi',
    'Jumat saya harus menyelesaikan laporan kepegawaian',
    'Setiap pagi jam 8 ingatkan saya cek pekerjaan hari ini',
    'Follow up Pak Andi besok jam 10 tentang berkas promosi',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-w-4xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-transparent dark:from-purple-950/20 dark:via-indigo-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>SiaNcaku AI Cerdas</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                Online & Siaga
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ketik instruksi bahasa natural, saya otomatis membuat tugas, jadwal, atau reminder
            </p>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] space-y-2 ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`inline-block p-4 rounded-2xl text-xs leading-relaxed text-left shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Parsed Action Card */}
                  {msg.parsedAction && (
                    <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-2.5 text-slate-900 dark:text-slate-100 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <span>Konfirmasi SiaNcaku:</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 font-bold">
                          {msg.parsedAction.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs font-bold">{msg.parsedAction.title}</div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        {msg.parsedAction.date && <div>📅 Tanggal: {msg.parsedAction.date}</div>}
                        {msg.parsedAction.time && <div>⏰ Waktu: {msg.parsedAction.time} WIB</div>}
                        {msg.parsedAction.location && <div>📍 Lokasi: {msg.parsedAction.location}</div>}
                        {msg.parsedAction.pic && <div>👤 PIC: {msg.parsedAction.pic}</div>}
                      </div>

                      <div className="pt-2">
                        {msg.parsedAction.isExecuted ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4" />
                            <span>Tersimpan di database SiaNcaku!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => executeParsedAction(msg.id)}
                            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Ya, Simpan Otomatis Sekarang</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-mono px-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>SiaNcaku sedang menganalisis instruksi Anda...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Fast Prompts */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold shrink-0">Contoh Cepat:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 shrink-0 font-medium transition"
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Chat Input Field */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Ketik instruksi, contoh: "Besok jam 9 ingatkan saya rapat staf"...'
            className="w-full pl-4 pr-12 py-3 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition active:scale-95 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
