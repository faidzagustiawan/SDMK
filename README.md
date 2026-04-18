# Kalkulator SDMK — Next.js

Frontend Next.js untuk Kalkulator SDMK. Backend tetap menggunakan Google Apps Script + Google Spreadsheet sebagai database.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi URL Apps Script

Salin file contoh:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi dengan URL deployment Apps Script Anda:

```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
```

> URL ini sama persis dengan `API_URL` yang ada di `index.html` lama.

### 3. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 4. Build untuk produksi

```bash
npm run build
npm start
```

---

## Struktur File

```
app/
  layout.js          # Root layout (AppProvider, Loader, Toast)
  page.js            # Redirect ke /dashboard atau /login
  globals.css        # Semua CSS dari index.html

  login/page.js      # Halaman login & register
  dashboard/
    layout.js        # Auth guard + Navbar + Sidebar
    page.js          # List perhitungan
  kalkulator/
    layout.js        # Auth guard + Navbar + Sidebar
    baru/page.js     # Form perhitungan baru
    [id]/page.js     # Edit / lihat hasil perhitungan
  profil/
    layout.js        # Auth guard
    page.js          # Profil user

components/
  Navbar.js          # Header bar
  Sidebar.js         # Sidebar navigasi
  ui/
    Toast.js         # Notifikasi toast
    Loader.js        # Loading overlay
    Modal.js         # Dialog modal reusable
  kalkulator/
    StepWKT.js       # Step 1: Waktu Kerja
    StepPokok.js     # Step 2: Tugas Pokok
    StepPenunjang.js # Step 3: Tugas Penunjang
    StepReview.js    # Step 4: Review & Hitung
    HasilView.js     # Tampilan hasil perhitungan

contexts/
  AppContext.js      # Auth state, loader, toast

hooks/
  useAuth.js         # Shortcut hook untuk auth

lib/
  api.js             # Wrapper fetch ke Apps Script
  sdmk-engine.js    # Kalkulasi WKT frontend (sama persis dengan original)
  utils.js           # fmt(), escHtml()
```

## Catatan

- **Tidak ada perubahan kalkulasi.** Semua logika hitung (`calcWKT`, `runHitung` di server) identik 100%.
- Backend (`Code.gs`) tidak perlu diubah sama sekali.
- Token auth tetap disimpan di `localStorage` seperti semula.
