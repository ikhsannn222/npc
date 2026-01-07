# E-PC Builder

Selamat datang di projek **E-PC Builder**, sebuah aplikasi web untuk membantu pengguna merakit PC impian mereka. Aplikasi ini menyediakan fitur rekomendasi otomatis, perakitan manual (Racik PC), katalog monitor, dan panel admin untuk manajemen komponen.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Panduan Instalasi & Setup](#-panduan-instalasi--setup)
  - [1. Setup Database](#1-setup-database)
  - [2. Setup Backend (Server)](#2-setup-backend-server)
  - [3. Setup Frontend (Client)](#3-setup-frontend-client)
- [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)

## 🌟 Fitur Utama

1.  **Rekomendasi PC (Home)**: Memberikan rekomendasi spesifikasi PC instan berdasarkan budget dan kebutuhan pengguna.
2.  **Racik PC**: Fitur interaktif untuk memilih komponen PC secara manual (Processor, Motherboard, RAM, GPU, dll) dengan pengecekan kompatibilitas sederhana dan kalkulasi total harga.
3.  **Monitor Page**: Katalog daftar monitor yang tersedia.
4.  **Admin Panel**: Halaman khusus untuk menambah, mengubah, atau menghapus data komponen dan monitor (CRUD Data).

## 🛠 Teknologi yang Digunakan

- **Frontend**: React.js (Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **ORM / Query Builder**: Knex.js.

## ⚙ Prasyarat Sistem

Sebelum memulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (Versi LTS disarankan)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (Sebagai database)

## 🚀 Panduan Instalasi & Setup

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan projek ini.

### 1. Setup Database

1.  Buka aplikasi MySQL client Anda (seperti phpMyAdmin, MySQL Workbench, atau DBeaver).
2.  Buat database baru dengan nama **`npc`**.
    ```sql
    CREATE DATABASE npc;
    ```
    _(Konfigurasi database ada di `server/knexfile.js`. Default user: `root`, password: kosong. Sesuaikan jika perlu)._

### 2. Setup Backend (Server)

1.  Buka terminal.
2.  Masuk ke direktori `server`.
    ```bash
    cd server
    ```
3.  Install dependencies.
    ```bash
    npm install
    ```
4.  Jalankan migrasi database untuk membuat tabel.
    ```bash
    npm run db:migrate
    ```
5.  Isi database dengan data awal (seeding).
    ```bash
    npm run db:seed
    ```
6.  Jalankan server backend.
    ```bash
    npm run dev
    ```
    _Server akan berjalan di `http://localhost:3000`._

### 3. Setup Frontend (Client)

1.  Buka terminal baru (biarkan terminal server tetap berjalan).
2.  Pastikan Anda berada di direktori root projek (folder `E-PC`).
    ```bash
    # Jika Anda masih di folder server:
    cd ..
    ```
3.  Install dependencies frontend.
    ```bash
    npm install
    ```
4.  Jalankan aplikasi frontend.
    ```bash
    npm run dev
    ```
    _Aplikasi biasanya akan berjalan di `http://localhost:5173`._

## ▶ Cara Menjalankan Aplikasi

Setiap kali ingin mengembangkan atau menggunakan aplikasi, pastikan untuk menjalankan **kedua** perintah ini di **dua terminal berbeda**:

**Terminal 1 (Backend):**

```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**

```bash
npm run dev
```

Buka browser dan akses URL yang muncul di Terminal 2 (biasanya `http://localhost:5173`) untuk mulai menggunakan E-PC Builder.
