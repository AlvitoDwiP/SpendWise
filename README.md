# SpendWise

SpendWise adalah aplikasi pencatatan keuangan fullstack untuk mencatat pemasukan dan pengeluaran, mengelola kategori, melihat ringkasan dashboard, membaca laporan periodik, mengatur profil pengguna, mereset data akun, dan menghapus akun. Repository ini dipisah menjadi dua aplikasi:

- `frontend/`: Next.js App Router untuk UI web.
- `backend/`: Go + Gin + GORM untuk REST API.

Dokumen ini ditulis sebagai README utama project. Tujuannya bukan hanya menjelaskan cara menjalankan aplikasi, tetapi juga menjadi panduan kerja tim agar pengembangan tetap konsisten, aman, dan maintainable.

## 1. Ringkasan Teknologi

### Frontend

- Framework: Next.js `16.2.4`
- Router: App Router (`src/app`)
- React: `19.2.4`
- Styling: global CSS + utility class project, dengan tema warm dark yang harus dipertahankan
- Bahasa: TypeScript strict mode
- Animasi: Framer Motion
- OAuth: Google OAuth (`@react-oauth/google`)

### Backend

- Bahasa: Go `1.26.2`
- HTTP framework: Gin
- ORM: GORM
- Database: PostgreSQL
- Auth: JWT Bearer Token
- OCR receipt: provider `mock` atau `tesseract`

## 2. Fitur Utama

- Autentikasi register, login, dan Google login
- Guest mode untuk dashboard sebelum login
- Dashboard ringkasan saldo, income, expense, dan transaksi terbaru
- Manajemen transaksi
- Manajemen kategori
- Report / laporan periodik
- Update profil
- Upload foto profil
- Ganti password
- Reset data user
- Delete account
- Scan receipt dengan OCR

## 3. Struktur Repository

```text
SpendWise/
├── README.md
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── public/
└── backend/
    ├── cmd/
    │   ├── api/
    │   └── devtest/
    ├── internal/
    │   ├── app/
    │   ├── config/
    │   ├── delivery/
    │   ├── domain/
    │   ├── services/
    │   └── utils/
    ├── test/
    └── uploads/
```

## 4. Struktur Frontend

Frontend memakai App Router. Entry route utama ada di `frontend/src/app`.

Struktur penting:

- `src/app/`
  Berisi route page seperti `/dashboard`, `/transactions`, `/categories`, `/report`, `/settings`, `/login`, `/register`.
- `src/components/`
  Berisi komponen shared lintas fitur, seperti layout, auth button, provider, dan UI primitive yang tidak tahu business logic.
- `src/features/`
  Berisi code per fitur, misalnya `auth`, `transactions`, `categories`, `dashboard`, `report`, dan `settings`.
- `src/lib/`
  Berisi helper lintas fitur seperti API client, formatting, dan helper auth.
- `src/hooks/`
  Berisi custom hooks reusable.
- `src/types/`
  Berisi shared type definitions.

### Prinsip frontend yang dipakai di repo ini

- UI primitive tidak boleh tahu API dan business logic.
- Feature module boleh memanggil service/helper yang memang milik fiturnya.
- API client harus reusable dan type-safe.
- Guest flow dan logged-in flow harus dipisah jelas, tetapi behavior existing tidak boleh berubah.
- Formatting currency, date, greeting, dan helper lain harus dipusatkan di utility, bukan diulang di page.

## 5. Struktur Backend

Backend dipisah secara modular walau belum sepenuhnya domain-driven. Struktur saat ini:

- `cmd/api/`
  Entry point server production/development utama.
- `internal/app/api/`
  Bootstrap server Gin, CORS, migration, dan route registration.
- `internal/config/`
  Konfigurasi environment dan database.
- `internal/delivery/http/`
  Layer HTTP, terdiri dari:
  - `handlers/` untuk parsing request dan response HTTP
  - `dto/` untuk shape request/response tertentu
  - `middlewares/` untuk auth middleware
  - `routes/` untuk pendaftaran endpoint
- `internal/domain/models/`
  Domain/entity model.
- `internal/domain/repositories/`
  Database access layer.
- `internal/services/`
  Business logic aplikasi.
- `internal/utils/`
  Helper umum seperti JWT, password, response, dan context.

### Prinsip backend yang dipakai di repo ini

- Handler harus setipis mungkin.
- Business logic berada di service.
- Query database berada di repository.
- Auth menggunakan JWT Bearer Token.
- Response JSON harus konsisten.
- Error internal tidak boleh diekspos mentah ke client jika sensitif.

## 6. Arsitektur Alur Request

### Frontend

Alur umum request frontend:

1. Page atau feature component memanggil function di `features/*/api.ts`.
2. Function tersebut memakai `src/lib/api/client.ts`.
3. API client membangun base URL, menyisipkan token jika ada, menangani JSON parsing, dan melempar error yang sudah dinormalisasi.
4. Page memutuskan behavior UI berdasarkan data atau error, misalnya tampilkan loading state, error state, redirect login, atau guest fallback.

### Backend

Alur umum request backend:

1. Request masuk ke Gin route.
2. Jika protected endpoint, request melewati `AuthMiddleware`.
3. Handler memvalidasi input HTTP.
4. Handler memanggil service.
5. Service menjalankan business logic dan memanggil repository jika perlu.
6. Repository berinteraksi dengan PostgreSQL via GORM.
7. Handler mengembalikan response JSON menggunakan helper response.

## 7. Auth Flow

### Guest flow

- User yang belum login dapat membuka dashboard guest.
- Data guest bernilai nol.
- Action protected harus mengarah ke login.

### Login flow

1. User mengirim email + password ke `POST /auth/login`.
2. Backend memverifikasi user dan password.
3. Backend mengembalikan token JWT.
4. Frontend menyimpan token di `localStorage`.
5. Request protected berikutnya mengirim header `Authorization: Bearer <token>`.

### Register flow

1. User mengirim nama, email, dan password ke `POST /auth/register`.
2. Backend membuat user baru jika email belum dipakai.

### Google login flow

1. Frontend hanya menampilkan Google provider jika `NEXT_PUBLIC_GOOGLE_CLIENT_ID` tersedia.
2. Token Google dikirim ke `POST /auth/google`.
3. Backend memvalidasi token terhadap `GOOGLE_CLIENT_ID`.

### Protected route / protected action

- Frontend memeriksa token sebelum memuat page tertentu.
- Backend tetap menjadi sumber kebenaran utama untuk authorization.
- Protected endpoint tidak boleh percaya `user_id` dari client bila user ID sudah tersedia dari token/context.

## 8. API Endpoint yang Tersedia

Semua route backend saat ini:

### Public endpoint

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`

### Protected endpoint

- `GET /me`
- `PUT /me`
- `PUT /me/photo`
- `PUT /me/password`
- `POST /me/reset-data`
- `DELETE /me`
- `DELETE /account`
- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /transactions`
- `GET /transactions/:id`
- `GET /transactions/recent`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `POST /transactions/scan-receipt`
- `GET /dashboard/summary`
- `GET /reports/monthly`

### Static asset

- `GET /uploads/*`

## 9. Format Response API

Backend sekarang mengembalikan response dengan pola umum berikut.

### Success response

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "invalid request body"
  },
  "message": "invalid request body"
}
```

Catatan:

- `message` di root masih dipertahankan untuk kompatibilitas client yang lama.
- Client baru sebaiknya membaca `error.code` dan `error.message` lebih dulu.

## 10. Environment Variable

### Backend environment

Buat file `backend/.env` berdasarkan `backend/.env.example`.

Contoh:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=spendwise
DB_SSLMODE=disable

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_HOURS=24
GOOGLE_CLIENT_ID=your_google_client_id

APP_PORT=8080
FRONTEND_URL=http://localhost:3000
OCR_PROVIDER=mock
```

Penjelasan:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`
  Konfigurasi PostgreSQL.
- `JWT_SECRET`
  Secret untuk sign token JWT.
- `JWT_EXPIRES_HOURS`
  Masa aktif token JWT.
- `GOOGLE_CLIENT_ID`
  Client ID Google untuk verifikasi Google login di backend.
- `APP_PORT`
  Port backend API.
- `FRONTEND_URL`
  Origin frontend yang diizinkan oleh CORS. Bisa berisi beberapa origin dipisahkan koma.
- `OCR_PROVIDER`
  Provider OCR. Nilai yang saat ini didukung:
  - `mock`
  - `tesseract`

### Frontend environment

Frontend menggunakan environment variable berikut:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Penjelasan:

- `NEXT_PUBLIC_API_BASE_URL`
  Base URL backend. Jika tidak diisi, frontend akan fallback ke `http://localhost:8080`.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  Dipakai oleh Google OAuth provider di frontend. Jika kosong, tombol Google login akan tidak aktif atau provider tidak dibungkus.

## 11. Status Dokumentasi

README ini menggambarkan kondisi repo saat ini berdasarkan struktur dan implementasi yang ada di repository. Jika ada perubahan route, env, contract response, atau command, README ini juga perlu diperbarui agar tetap menjadi sumber informasi yang akurat.
