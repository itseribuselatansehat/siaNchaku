import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : null;
const PORT = Number(process.env.PORT || portFromArg || 3000);

const hostArgIndex = process.argv.indexOf('--host');
const hostFromArg = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : null;
const HOST = process.env.HOST || hostFromArg || '0.0.0.0';

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: AI Assistant Natural Language Command Parser
app.post('/api/ai/parse-command', async (req, res) => {
  const { command, userTimezone = 'Asia/Jakarta', nowIso } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command text is required' });
  }

  // Fallback rule-based parsing helper for offline or when API key is missing
  const fallbackParse = (text: string) => {
    const lower = text.toLowerCase();
    const now = nowIso ? new Date(nowIso) : new Date();

    let type: 'task' | 'schedule' | 'reminder' | 'followup' | 'note' = 'reminder';
    let title = text.replace(/^(ingatkan saya|tolong ingatkan|jadwalkan|buat tugas|catat)\s+/i, '').trim();
    let dateStr = now.toISOString().split('T')[0];
    let timeStr = '09:00';
    let recurring = 'none';

    // Time detection
    const timeMatch = lower.match(/(jam|pukul)\s*(\d{1,2})([.:](\d{2}))?/);
    if (timeMatch) {
      const hours = String(parseInt(timeMatch[2], 10)).padStart(2, '0');
      const mins = timeMatch[4] ? String(parseInt(timeMatch[4], 10)).padStart(2, '0') : '00';
      timeStr = `${hours}:${mins}`;
    }

    // Day detection
    if (lower.includes('besok')) {
      const tmrw = new Date(now.getTime() + 86400000);
      dateStr = tmrw.toISOString().split('T')[0];
    } else if (lower.includes('lusa')) {
      const lusa = new Date(now.getTime() + 172800000);
      dateStr = lusa.toISOString().split('T')[0];
    }

    // Recurrence
    if (lower.includes('setiap hari') || lower.includes('tiap hari')) {
      recurring = 'daily';
    } else if (lower.includes('setiap senin') || lower.includes('tiap senin')) {
      recurring = 'weekly';
    } else if (lower.includes('setiap pagi')) {
      recurring = 'daily';
      timeStr = '08:00';
    }

    if (lower.includes('tugas') || lower.includes('harus') || lower.includes('selesaikan')) {
      type = 'task';
    } else if (lower.includes('rapat') || lower.includes('agenda') || lower.includes('jadwal') || lower.includes('pertemuan')) {
      type = 'schedule';
    } else if (lower.includes('follow up') || lower.includes('hubungi') || lower.includes('tanyakan')) {
      type = 'followup';
    } else if (lower.includes('catat') || lower.includes('ide')) {
      type = 'note';
    }

    return {
      type,
      title: title || 'Aktivitas Baru',
      date: dateStr,
      time: timeStr,
      recurring,
      priority: 'Tinggi',
      category: 'Pekerjaan',
      confirmationMessage: `Baik, saya telah mencatat ${type === 'task' ? 'tugas' : type === 'schedule' ? 'agenda' : 'pengingat'} "${title || 'Aktivitas'}" untuk ${dateStr} pukul ${timeStr}.`,
    };
  };

  if (!ai) {
    const parsed = fallbackParse(command);
    return res.json({ parsed, source: 'heuristics' });
  }

  try {
    const prompt = `Anda adalah asisten cerdas bahasa Indonesia untuk aplikasi "SiaNcaku".
Pengguna memberikan perintah natural seperti:
- "Besok jam 9 ingatkan saya rapat evaluasi"
- "Jumat saya harus menyelesaikan laporan kepegawaian"
- "Setiap pagi jam 8 ingatkan saya mengecek pekerjaan hari ini"
- "Hubungi Pak Budi lusa tentang kontrak kerja"
- "Catat ide: tambahkan export PDF ke aplikasi"

Waktu saat ini pengguna: ${nowIso || new Date().toISOString()} (Zona waktu: ${userTimezone}).
Analisis perintah berikut dan kembalikan struktur data JSON:
Perintah: "${command}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: 'Tipe entitas: "task", "schedule", "reminder", "followup", atau "note"',
            },
            title: {
              type: Type.STRING,
              description: 'Judul ringkas dan jelas dari kegiatan/tugas/catatan',
            },
            description: {
              type: Type.STRING,
              description: 'Deskripsi tambahan atau detail informasi jika ada',
            },
            date: {
              type: Type.STRING,
              description: 'Tanggal dalam format YYYY-MM-DD (dihitung relatif dari waktu saat ini)',
            },
            time: {
              type: Type.STRING,
              description: 'Waktu dalam format HH:mm 24 jam (misal 09:00 atau 14:30)',
            },
            endTime: {
              type: Type.STRING,
              description: 'Waktu selesai (untuk jadwal) jika disebutkan, misal 11:00',
            },
            location: {
              type: Type.STRING,
              description: 'Lokasi jika disebutkan, misal "Ruang Pertemuan" atau "Zoom"',
            },
            pic: {
              type: Type.STRING,
              description: 'Nama orang / PIC yang dihubungi jika berupa follow up',
            },
            priority: {
              type: Type.STRING,
              description: '"Tinggi", "Sedang", atau "Rendah"',
            },
            category: {
              type: Type.STRING,
              description: '"Pekerjaan", "Pribadi", "Rapat", "Keuangan", "Ide", atau "Follow Up"',
            },
            recurring: {
              type: Type.STRING,
              description: '"none", "daily", "weekly", "monthly", atau "workdays"',
            },
            confirmationMessage: {
              type: Type.STRING,
              description: 'Kalimat konfirmasi ramah dan profesional dalam Bahasa Indonesia dari SiaNcaku kepada pengguna (misal: "Baik, saya akan mengingatkan Anda besok pukul 09.00.")',
            },
          },
          required: ['type', 'title', 'confirmationMessage'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({ parsed: parsedData, source: 'gemini' });
  } catch (error: any) {
    console.warn('Gemini parser fallback to heuristics:', error?.message);
    const parsed = fallbackParse(command);
    return res.json({ parsed, source: 'heuristics-fallback' });
  }
});

// API Route: AI Assistant Chat & Productivity Coaching
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const latestUserMessage = messages[messages.length - 1]?.content || '';

  if (!ai) {
    return res.json({
      reply: `Halo! Saya SiaNcaku. Saya siap membantu Anda mencatat tugas, mengatur jadwal, dan mengingatkan pekerjaan hari ini. Anda memiliki ${userContext?.pendingTasksCount || 0} tugas yang belum selesai hari ini. Ada yang bisa saya bantu catatkan?`,
    });
  }

  try {
    const systemInstruction = `Anda adalah "SiaNcaku", asisten pribadi digital yang profesional, ramah, ringkas, proaktif, dan tidak pernah lupa.
Tagline Anda: "Asisten pribadi yang tidak pernah lupa."
Prinsip utama Anda: "Catat → Atur → Ingatkan → Pantau → Selesaikan → Evaluasi".

Gaya bicara:
- Bahasa Indonesia yang santun, profesional, jelas, dan memotivasi tanpa hiperbola.
- Selalu memprioritaskan produktivitas dan ketenangan pikiran pengguna.
- Jika pengguna ingin membuat tugas/jadwal/reminder, beri tahu bahwa Anda dapat langsung menjadwalkannya.
- Konteks pengguna saat ini:
  - Waktu sekarang: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
  - Ringkasan: ${JSON.stringify(userContext || {})}`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text || 'Siap, saya mengerti. Ada hal lain yang perlu diingat?' });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML requests to guarantee correct transformed index.html
    app.use('*', async (req, res, next) => {
      if (req.method !== 'GET') return next();
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`SiaNcaku server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch(console.error);
