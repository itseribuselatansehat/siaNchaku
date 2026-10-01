import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Database,
  Terminal,
  ShieldCheck,
  AlertCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  GOOGLE_SHEETS_STRUCTURE,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../data/gasCodeTemplate';

export const GasIntegrationView: React.FC = () => {
  const { user, updateUser, syncWithGas, exportDataJson, importDataJson } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [gasUrlInput, setGasUrlInput] = useState(user.gasWebhookUrl || '');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'schema' | 'guide' | 'backup'>('script');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCodeGs = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveGasUrl = () => {
    updateUser({ gasWebhookUrl: gasUrlInput.trim() });
    setSyncResult({ success: true, message: 'URL Web App SiaNcaku berhasil disimpan!' });
  };

  const handleSyncNow = async () => {
    if (!gasUrlInput.trim()) {
      setSyncResult({
        success: false,
        message: 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }
    setSyncLoading(true);
    setSyncResult(null);
    updateUser({ gasWebhookUrl: gasUrlInput.trim() });
    const res = await syncWithGas();
    setSyncResult(res);
    setSyncLoading(false);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SiaNcaku_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        alert('Data SiaNcaku berhasil diimpor dan dipulihkan!');
      } else {
        alert('Gagal membaca berkas JSON. Format tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Integrasi Google Spreadsheet & Apps Script (SiaNcaku)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gunakan Google Spreadsheet sebagai database cloud permanen dengan fungsi auto-setup langsung jadi
        </p>
      </div>

      {/* Instant Setup Banner (Langsung Jadi) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-emerald-100">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Fitur Baru: 1-Klik Auto-Setup Database Spreadsheet</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Database Spreadsheet Langsung Jadi Tanpa Ketik Manual!
          </h3>
          <p className="text-xs text-emerald-50 leading-relaxed font-medium">
            Salin berkas <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono font-bold">Code.gs</code> ke Apps Script Anda, lalu jalankan fungsi <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono font-bold">setupDatabase()</code>. Sistem otomatis membuat ke-7 tabel sheet lengkap dengan warna header, baris beku (freeze), contoh data, dan trigger 5 menit anti-duplikasi!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shadow-md transition active:scale-95"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Code.gs Tersalin!' : 'Salin Code.gs'}</span>
          </button>

          <button
            onClick={handleDownloadCodeGs}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-white/20 text-white font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File (.gs)</span>
          </button>
        </div>
      </div>

      {/* Webhook Connection Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Koneksi Sinkronisasi Web App URL</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            URL didapatkan dari menu Deploy &gt; New Deployment di Google Apps Script
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={gasUrlInput}
            onChange={e => setGasUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
            className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveGasUrl}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Simpan URL
            </button>
            <button
              onClick={handleSyncNow}
              disabled={syncLoading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>
        </div>

        {syncResult && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              syncResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {syncResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncResult.message}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('script')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'script'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Kode Backend (Code.gs)
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'schema'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Struktur 7 Tabel Otomatis
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'guide'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Panduan Langkah Demi Langkah
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'backup'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cadangan JSON Lokal
        </button>
      </div>

      {/* TAB 1: SCRIPT (Code.gs) */}
      {activeTab === 'script' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Skrip Lengkap `Code.gs` untuk SiaNcaku
              </h3>
              <p className="text-[11px] text-slate-400">
                Lengkap dengan menu toolbar khusus Google Sheets, setup database otomatis, REST API, & trigger anti-duplikasi
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOOGLE_SHEETS_STRUCTURE.map(sheet => (
              <div
                key={sheet.sheetName}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                    style={{ backgroundColor: sheet.color }}
                  >
                    Sheet: {sheet.sheetName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {sheet.columns.length} Kolom
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {sheet.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {sheet.columns.map((col, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STEP-BY-STEP DEPLOYMENT GUIDE */}
      {activeTab === 'guide' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Panduan Menjalankan Auto-Setup Database SiaNcaku
          </h3>

          <ol className="space-y-4 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
            <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <strong>Langkah 1: Buat Spreadsheet Kosong</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Buka tab baru dan ketik <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline">sheets.new</a>, lalu beri judul spreadsheet misalnya <strong>"Database SiaNcaku"</strong>.
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <strong>Langkah 2: Buka Apps Script</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Di Google Spreadsheet tersebut, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <strong>Langkah 3: Tempelkan Skrip Code.gs</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Hapus fungsi bawaan <code className="font-mono">myFunction()</code>, lalu salin seluruh kode dari tab <strong>Kode Backend (Code.gs)</strong> di atas dan tempelkan. Simpan proyek dengan menekan tombol disket atau <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border">Ctrl + S</kbd>.
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <strong>Langkah 4: Jalankan Inisialisasi Langsung Jadi (`setupDatabase`)</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Pada toolbar atas Apps Script, pilih fungsi <strong>setupDatabase</strong> dari dropdown, lalu klik tombol <strong>Jalankan (Run)</strong>.
                Setujui izin akses akun Google pertama kali.
                <br /><span className="text-emerald-600 dark:text-emerald-400 font-bold">Hasil:</span> Seluruh 7 sheet tabel langsung terbuat rapi beserta header warna, baris beku, dan trigger 5 menit otomatis aktif!
              </p>
            </li>

            <li className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <strong>Langkah 5: Terapkan Sebagai Web App (Deploy)</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Klik tombol biru <strong>Deploy</strong> di pojok kanan atas &gt; <strong>New deployment</strong>.
                <br />• Pilih jenis: <strong>Web app</strong>
                <br />• Execute as: <strong>Me</strong>
                <br />• Who has access: <strong>Anyone</strong>
                <br />Salin URL yang berakhiran <code className="font-mono text-indigo-600">/exec</code> lalu tempelkan ke kolom URL Sinkronisasi di atas.
              </p>
            </li>
          </ol>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE JSON */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cadangan & Pemulihan Data SiaNcaku (JSON)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simpan seluruh data tugas, jadwal, catatan, pengingat, dan riwayat ke berkas JSON lokal
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas Cadangan (.json)</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Pulihkan dari Berkas JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
