export const GOOGLE_SHEETS_STRUCTURE = [
  {
    sheetName: 'USERS',
    columns: ['ID', 'Nama', 'Email', 'Foto', 'CreatedAt'],
    description: 'Profil pengguna SiaNcaku & pengaturan sinkronisasi',
    color: '#4f46e5',
  },
  {
    sheetName: 'TASKS',
    columns: ['ID', 'UserID', 'Judul', 'Deskripsi', 'Deadline', 'Prioritas', 'Status', 'Kategori', 'Reminder', 'CreatedAt', 'UpdatedAt'],
    description: 'Daftar tugas, tenggat waktu (deadline), dan status pekerjaan',
    color: '#10b981',
  },
  {
    sheetName: 'SCHEDULES',
    columns: ['ID', 'UserID', 'Judul', 'Tanggal', 'WaktuMulai', 'WaktuSelesai', 'Lokasi', 'Deskripsi', 'Reminder', 'Recurring', 'CreatedAt'],
    description: 'Jadwal dan agenda rapat, kegiatan harian, atau pertemuan resmi',
    color: '#0284c7',
  },
  {
    sheetName: 'NOTES',
    columns: ['ID', 'UserID', 'Tanggal', 'Jam', 'Judul', 'Isi', 'Kategori', 'CreatedAt'],
    description: 'Catatan harian, hasil pekerjaan, notula rapat, dan ide kreatif',
    color: '#9333ea',
  },
  {
    sheetName: 'REMINDERS',
    columns: ['ID', 'UserID', 'Judul', 'Tanggal', 'Waktu', 'Tipe', 'Recurring', 'Status', 'CreatedAt'],
    description: 'Pengingat aktif dan berulang yang dipantau otomatis oleh trigger',
    color: '#f59e0b',
  },
  {
    sheetName: 'FOLLOWUPS',
    columns: ['ID', 'UserID', 'Judul', 'PIC', 'Deskripsi', 'Deadline', 'Status', 'Reminder', 'CreatedAt'],
    description: 'Pekerjaan tindak lanjut dengan rekan, pimpinan, atau mitra eksternal',
    color: '#06b6d4',
  },
  {
    sheetName: 'ACTIVITY_LOG',
    columns: ['ID', 'UserID', 'Aktivitas', 'Waktu'],
    description: 'Rekam jejak otomatis riwayat aktivitas pengguna',
    color: '#64748b',
  },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SIANCAKU - GOOGLE APPS SCRIPT BACKEND & AUTOMATED DATABASE ENGINE
 * Tagline: "Asisten pribadi yang tidak pernah lupa."
 * Aplikasi: SiaNcaku
 * =========================================================================
 * 
 * FITUR UTAMA CODE.GS INI:
 * 1. onOpen(): Otomatis membuat menu "✨ SiaNcaku" di toolbar Google Sheets.
 * 2. setupDatabase(): Sekali klik langsung membuat SEMUA 7 SHEET tabel lengkap dengan:
 *    - Header berwarna rapi & modern
 *    - Baris dibekukan (frozen header)
 *    - Format kolom otomatis & contoh data awal siap pakai
 *    - Trigger waktu 5 menit otomatis dibuat tanpa perlu setting manual!
 * 3. checkRemindersTrigger(): Memeriksa pengingat & deadline setiap 5 menit,
 *    mengirimkan email notifikasi, serta mencegah pengiriman ganda (anti-duplicate).
 * 4. doGet() & doPost(): REST API untuk sinkronisasi 2 arah dengan Web App SiaNcaku.
 */

const SIANCAKU_CONFIG = {
  APP_NAME: "SiaNcaku",
  TIMEZONE: "Asia/Jakarta",
  TRIGGER_FUNCTION: "checkRemindersTrigger",
  TRIGGER_INTERVAL_MINUTES: 5,
  SHEETS: {
    USERS: "USERS",
    TASKS: "TASKS",
    SCHEDULES: "SCHEDULES",
    NOTES: "NOTES",
    REMINDERS: "REMINDERS",
    FOLLOWUPS: "FOLLOWUPS",
    ACTIVITY_LOG: "ACTIVITY_LOG"
  }
};

/**
 * 1. MENU OTOMATIS DI GOOGLE SPREADSHEET
 * Setiap kali spreadsheet dibuka, menu "✨ SiaNcaku" akan muncul di atas!
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("✨ SiaNcaku")
    .addItem("🚀 Setup Database Otomatis (Langsung Jadi)", "setupDatabase")
    .addItem("⏰ Cek Pengingat Sekarang", "checkRemindersTrigger")
    .addSeparator()
    .addItem("ℹ️ Status Database & Trigger", "showDatabaseStatus")
    .addToUi();
}

/**
 * 2. SETUP DATABASE OTOMATIS - SEKALI KLIK LANGSUNG JADI!
 * Buat semua sheet, header, styling, dan data awal dalam hitungan detik.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Skema Tabel Lengkap & Warna Header
  const tables = [
    {
      name: "USERS",
      headers: ["ID", "Nama", "Email", "Foto", "CreatedAt"],
      color: "#4338ca", // Indigo
      sampleData: [
        ["USR-001", "Budi Pratama", Session.getActiveUser().getEmail() || "user@example.com", "https://images.unsplash.com/photo-1534528741775-53994a69daeb", new Date().toISOString()]
      ]
    },
    {
      name: "TASKS",
      headers: ["ID", "UserID", "Judul", "Deskripsi", "Deadline", "Prioritas", "Status", "Kategori", "Reminder", "CreatedAt", "UpdatedAt"],
      color: "#059669", // Emerald
      sampleData: [
        ["TSK-101", "USR-001", "Menyelesaikan Laporan Bulanan", "Kompilasi rekapitulasi data dan usulan kegiatan", getFormattedDateOffset(0) + "T16:00", "Tinggi", "Sedang dikerjakan", "Pekerjaan", 30, new Date().toISOString(), new Date().toISOString()],
        ["TSK-102", "USR-001", "Pemeriksaan Berkas SPJ", "Verifikasi kuitansi dan tanda terima pelatihan", getFormattedDateOffset(1) + "T17:00", "Sedang", "Belum dimulai", "Keuangan", 15, new Date().toISOString(), new Date().toISOString()]
      ]
    },
    {
      name: "SCHEDULES",
      headers: ["ID", "UserID", "Judul", "Tanggal", "WaktuMulai", "WaktuSelesai", "Lokasi", "Deskripsi", "Reminder", "Recurring", "CreatedAt"],
      color: "#0284c7", // Sky
      sampleData: [
        ["SCH-201", "USR-001", "Rapat Koordinasi Staf Mingguan", getFormattedDateOffset(0), "08:30", "10:00", "Ruang Rapat Utama & Google Meet", "Evaluasi target mingguan dan pembagian PIC tugas baru", 15, "weekly", new Date().toISOString()],
        ["SCH-202", "USR-001", "Monitoring Lapangan Unit C", getFormattedDateOffset(0), "13:30", "15:00", "Gedung Pelayanan Terpadu", "Pengecekan fasilitas dan operasional sistem", 30, "none", new Date().toISOString()]
      ]
    },
    {
      name: "NOTES",
      headers: ["ID", "UserID", "Tanggal", "Jam", "Judul", "Isi", "Kategori", "CreatedAt"],
      color: "#7e22ce", // Purple
      sampleData: [
        ["NOT-301", "USR-001", getFormattedDateOffset(0), "10:15", "Hasil Rapat Staf Pagi", "Seluruh berkas administrasi harus terunggah ke sistem sebelum hari Kamis sore.", "Rapat", new Date().toISOString()],
        ["NOT-302", "USR-001", getFormattedDateOffset(0), "11:45", "Ide Integrasi Otomasi Notifikasi", "Gunakan Apps Script Webhook untuk push notifikasi instan ke aplikasi SiaNcaku.", "Ide", new Date().toISOString()]
      ]
    },
    {
      name: "REMINDERS",
      headers: ["ID", "UserID", "Judul", "Tanggal", "Waktu", "Tipe", "Recurring", "Status", "CreatedAt"],
      color: "#d97706", // Amber
      sampleData: [
        ["REM-401", "USR-001", "Rapat Koordinasi Staf", getFormattedDateOffset(0), "08:15", "agenda", "weekly", "pending", new Date().toISOString()],
        ["REM-402", "USR-001", "Deadline Laporan Bulanan", getFormattedDateOffset(0), "15:30", "deadline", "none", "pending", new Date().toISOString()]
      ]
    },
    {
      name: "FOLLOWUPS",
      headers: ["ID", "UserID", "Judul", "PIC", "Deskripsi", "Deadline", "Status", "Reminder", "CreatedAt"],
      color: "#0891b2", // Cyan
      sampleData: [
        ["FLW-501", "USR-001", "Konfirmasi Dokumen Kenaikan Pangkat", "Pak Andi (Kepegawaian)", "Menanyakan verifikasi tanda tangan surat pengantar", getFormattedDateOffset(0), "Perlu Dihubungi Lagi", "11:00", new Date().toISOString()]
      ]
    },
    {
      name: "ACTIVITY_LOG",
      headers: ["ID", "UserID", "Aktivitas", "Waktu"],
      color: "#475569", // Slate
      sampleData: [
        ["LOG-001", "USR-001", "Inisialisasi Database SiaNcaku Berhasil", Utilities.formatDate(new Date(), SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss")]
      ]
    }
  ];
  
  // Buat dan rapikan setiap tabel
  tables.forEach(table => {
    let sheet = ss.getSheetByName(table.name);
    if (!sheet) {
      sheet = ss.insertSheet(table.name);
    }
    
    // Jika sheet masih baru atau kosong, pasang header dan contoh data
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(table.headers);
      
      // Berikan style header premium
      const headerRange = sheet.getRange(1, 1, 1, table.headers.length);
      headerRange.setFontWeight("bold")
        .setFontColor("#ffffff")
        .setBackground(table.color)
        .setFontSize(10)
        .setHorizontalAlignment("center");
      
      sheet.setFrozenRows(1);
      
      // Tambahkan sample data
      if (table.sampleData && table.sampleData.length > 0) {
        table.sampleData.forEach(row => sheet.appendRow(row));
      }
      
      // Atur lebar kolom agar proporsional
      for (let c = 1; c <= table.headers.length; c++) {
        sheet.autoResizeColumn(c);
      }
    }
  });
  
  // Hapus sheet default "Sheet1" jika ada dan sudah tidak diperlukan
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
  
  // Pasang trigger otomatis jika belum ada
  createReminderTrigger();
  
  // Tampilkan notifikasi sukses di Spreadsheet
  try {
    ss.toast("Database SiaNcaku berhasil di-setup lengkap dengan trigger 5 menit!", "✅ Sukses SiaNcaku", 5);
  } catch (e) {
    Logger.log("✅ Database SiaNcaku berhasil di-inisialisasi!");
  }
}

/**
 * 3. TRIGGER WAKTU OTOMATIS (TIME-DRIVEN)
 * Memastikan trigger pengingat aktif setiap 5 menit.
 */
function createReminderTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === SIANCAKU_CONFIG.TRIGGER_FUNCTION);
  
  if (!exists) {
    ScriptApp.newTrigger(SIANCAKU_CONFIG.TRIGGER_FUNCTION)
      .timeBased()
      .everyMinutes(SIANCAKU_CONFIG.TRIGGER_INTERVAL_MINUTES)
      .create();
    Logger.log("⏰ Trigger otomatis SiaNcaku aktif setiap " + SIANCAKU_CONFIG.TRIGGER_INTERVAL_MINUTES + " menit.");
  }
}

/**
 * 4. ENGINE PENGINGAT (ANTI-DUPLIKASI & NOTIFIKASI EMAIL)
 * Dijalankan otomatis setiap 5 menit oleh Google Apps Script Trigger
 */
function checkRemindersTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reminderSheet = ss.getSheetByName(SIANCAKU_CONFIG.SHEETS.REMINDERS);
  const logSheet = ss.getSheetByName(SIANCAKU_CONFIG.SHEETS.ACTIVITY_LOG);
  
  if (!reminderSheet) return;
  
  const data = reminderSheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const headers = data[0];
  const col = {
    id: headers.indexOf("ID"),
    userId: headers.indexOf("UserID"),
    title: headers.indexOf("Judul"),
    date: headers.indexOf("Tanggal"),
    time: headers.indexOf("Waktu"),
    type: headers.indexOf("Tipe"),
    recurring: headers.indexOf("Recurring"),
    status: headers.indexOf("Status"),
  };
  
  const now = new Date();
  const nowDateStr = Utilities.formatDate(now, SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd");
  const nowTimeStr = Utilities.formatDate(now, SIANCAKU_CONFIG.TIMEZONE, "HH:mm");
  
  const userEmail = Session.getActiveUser().getEmail();
  let triggeredCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = String(row[col.status]).toLowerCase();
    
    // Normalisasi tanggal
    let remDateStr = "";
    if (row[col.date] instanceof Date) {
      remDateStr = Utilities.formatDate(row[col.date], SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd");
    } else {
      remDateStr = String(row[col.date]).trim();
    }
    
    const remTimeStr = String(row[col.time]).trim();
    const title = String(row[col.title]).trim();
    const recurring = String(row[col.recurring] || "none").toLowerCase();
    
    // Hanya periksa reminder yang masih berstatus 'pending'
    if (status === "pending" || status === "aktif") {
      if (remDateStr === nowDateStr && remTimeStr <= nowTimeStr) {
        triggeredCount++;
        
        // --- A. KIRIM NOTIFIKASI EMAIL ---
        if (userEmail) {
          const subject = "🔔 Pengingat SiaNcaku: " + title;
          const body = [
            "Halo!",
            "",
            "SiaNcaku mengingatkan agenda / pekerjaan penting Anda:",
            "📌 Judul: " + title,
            "📅 Tanggal: " + remDateStr,
            "⏰ Waktu: " + remTimeStr + " WIB",
            "",
            "Pesan ini dikirim otomatis oleh SiaNcaku - Asisten pribadi yang tidak pernah lupa.",
            "Silakan buka aplikasi SiaNcaku untuk memperbarui progres pekerjaan Anda."
          ].join("\\n");
          
          try {
            MailApp.sendEmail(userEmail, subject, body);
          } catch (e) {
            Logger.log("Email dispatch warning: " + e.message);
          }
        }
        
        // --- B. CEGAH DUPLIKASI: UPDATE STATUS ATAU MAJUKAN TANGGAL JIKA BERULANG ---
        const rowNumber = i + 1;
        if (recurring && recurring !== "none" && recurring !== "sekali") {
          const nextDate = getNextRecurringDate(remDateStr, recurring);
          reminderSheet.getRange(rowNumber, col.date + 1).setValue(nextDate);
          reminderSheet.getRange(rowNumber, col.status + 1).setValue("pending");
        } else {
          reminderSheet.getRange(rowNumber, col.status + 1).setValue("terkirim");
        }
        
        // --- C. CATAT KE LOG AKTIVITAS ---
        if (logSheet) {
          logSheet.appendRow([
            "LOG-" + Utilities.getUuid().slice(0, 8),
            row[col.userId] || "USR-001",
            "Pengingat terkirim: " + title + " (" + remTimeStr + " WIB)",
            Utilities.formatDate(now, SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss")
          ]);
        }
      }
    }
  }
  
  if (triggeredCount > 0) {
    Logger.log("Berhasil memproses " + triggeredCount + " pengingat.");
  }
}

/**
 * 5. WEB APP REST API (doGet & doPost)
 * Jalur komunikasi antara aplikasi Web SiaNcaku dan Google Spreadsheet
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "ping";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "ping") {
    return createJsonResponse({
      status: "success",
      appName: SIANCAKU_CONFIG.APP_NAME,
      message: "Backend Google Apps Script SiaNcaku aktif dan siap!",
      timestamp: Utilities.formatDate(new Date(), SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss")
    });
  }
  
  if (action === "getAllData") {
    const result = {};
    for (const key in SIANCAKU_CONFIG.SHEETS) {
      const name = SIANCAKU_CONFIG.SHEETS[key];
      const sheet = ss.getSheetByName(name);
      if (sheet && sheet.getLastRow() > 1) {
        const rows = sheet.getDataRange().getValues();
        const headers = rows[0];
        result[key] = rows.slice(1).map(r => {
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = r[idx]; });
          return obj;
        });
      } else {
        result[key] = [];
      }
    }
    return createJsonResponse({ status: "success", data: result });
  }
  
  return createJsonResponse({ status: "error", message: "Aksi tidak dikenali" });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "syncAll") {
      const data = payload.data || {};
      for (const sheetKey in data) {
        const sheetName = SIANCAKU_CONFIG.SHEETS[sheetKey] || sheetKey;
        const sheet = ss.getSheetByName(sheetName);
        if (sheet && Array.isArray(data[sheetKey])) {
          // Bersihkan data lama kecuali header
          if (sheet.getLastRow() > 1) {
            sheet.deleteRows(2, sheet.getLastRow() - 1);
          }
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          const rowsToInsert = data[sheetKey].map(item => {
            return headers.map(h => (item[h] !== undefined && item[h] !== null) ? item[h] : "");
          });
          if (rowsToInsert.length > 0) {
            sheet.getRange(2, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
          }
        }
      }
      return createJsonResponse({ status: "success", message: "Data SiaNcaku berhasil disinkronkan ke Google Spreadsheet!" });
    }
    
    return createJsonResponse({ status: "error", message: "Aksi POST tidak didukung" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * HELPER FUNCTIONS
 */
function getFormattedDateOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return Utilities.formatDate(d, SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function getNextRecurringDate(dateStr, recurringType) {
  const parts = String(dateStr).split("-");
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (recurringType === "daily" || recurringType === "setiap hari") {
    d.setDate(d.getDate() + 1);
  } else if (recurringType === "weekly" || recurringType === "setiap minggu") {
    d.setDate(d.getDate() + 7);
  } else if (recurringType === "monthly" || recurringType === "setiap bulan") {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setDate(d.getDate() + 1);
  }
  return Utilities.formatDate(d, SIANCAKU_CONFIG.TIMEZONE, "yyyy-MM-dd");
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function showDatabaseStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  const count = triggers.filter(t => t.getHandlerFunction() === SIANCAKU_CONFIG.TRIGGER_FUNCTION).length;
  const msg = [
    "📌 Nama Aplikasi: SiaNcaku",
    "📊 Jumlah Sheet: " + ss.getSheets().length,
    "⏰ Trigger 5 Menit: " + (count > 0 ? "AKTIF ✅" : "BELUM AKTIF ⚠️")
  ].join("\\n");
  SpreadsheetApp.getUi().alert("Status Database SiaNcaku", msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
`;
