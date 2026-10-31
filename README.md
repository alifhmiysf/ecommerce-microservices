# 🛒 E-Commerce Microservices Project

Proyek ini merupakan implementasi aplikasi **E-Commerce sederhana berbasis arsitektur Microservices** menggunakan Laravel sebagai backend dan React sebagai frontend.

Aplikasi terdiri dari tiga backend service yang memiliki tanggung jawab dan database masing-masing. Komunikasi antarservice dilakukan melalui HTTP API, sedangkan Nginx digunakan sebagai API Gateway pada konfigurasi Docker.

Proyek ini dibuat sebagai sarana pembelajaran untuk memahami:

- Arsitektur Microservices.
- REST API menggunakan Laravel.
- Pengembangan frontend menggunakan React.
- Komunikasi antarservice (Inter-Service Communication).
- Database Isolation.
- Docker Multi-Container Architecture.
- API Gateway menggunakan Nginx.

---

## ✨ Fitur Utama

- Menampilkan katalog produk.
- Pencarian produk.
- Filter produk berdasarkan kategori.
- Menampilkan harga dan stok produk.
- Menambahkan produk ke keranjang.
- Registrasi dan login pengguna.
- Autentikasi pengguna menggunakan token.
- Membuat dan melihat transaksi.
- Validasi pengguna melalui User Service.
- Pengambilan informasi produk melalui Product Service.
- Pengurangan stok produk ketika transaksi berhasil.

---

## 🏗️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Laravel 12
- PHP 8.2
- REST API

### Database
- MySQL

### Infrastructure
- Docker
- Docker Compose
- Nginx API Gateway

---

## 🧱 Architecture Overview

Aplikasi menggunakan arsitektur Microservices yang memisahkan frontend dan backend menjadi beberapa komponen.

```text
                 Client / Browser
                        |
                        v
                 React Frontend
                        |
                        v
                  Nginx Gateway
                        |
           +------------+------------+
           |            |            |
           v            v            v
       User Service  Product      Transaction
          Laravel     Service       Service
             |        Laravel       Laravel
             v            v            v
          MySQL        MySQL        MySQL
```

Setiap service memiliki tanggung jawab tersendiri:

| Service | Teknologi | Tanggung Jawab |
|---|---|---|
| User Service | Laravel + MySQL | Registrasi, login, dan autentikasi pengguna |
| Product Service | Laravel + MySQL | Pengelolaan produk, kategori, harga, dan stok |
| Transaction Service | Laravel + MySQL | Pengelolaan transaksi |
| Frontend | React + Vite | Antarmuka aplikasi |
| API Gateway | Nginx | Routing request ke backend service |

---

## 📂 Project Structure

```text
ecommerce-microservices/
│
├── frontend/                 # React frontend
│
├── user-service/             # User & Authentication Service
│
├── product-service/          # Product Service
│
├── transaction-service/      # Transaction Service
│
├── nginx/                    # Nginx API Gateway
│
├── docker-compose.yml        # Docker orchestration
│
└── README.md
```

---

## 🔌 API Endpoints

Pada konfigurasi menggunakan Nginx API Gateway, request dapat diakses melalui:

```text
http://localhost
```

Berikut beberapa endpoint utama:

| Service | Endpoint | Method | Keterangan |
|---|---|---|---|
| User | `/users/api/...` | ALL | Autentikasi dan pengelolaan pengguna |
| Product | `/products/api/products` | GET | Menampilkan daftar produk |
| Product | `/products/api/products` | POST | Menambahkan produk |
| Product | `/products/api/products/{id}` | GET | Menampilkan detail produk |
| Transaction | `/transactions/api/transactions` | GET | Menampilkan daftar transaksi |
| Transaction | `/transactions/api/transactions` | POST | Membuat transaksi |

Endpoint mengikuti konfigurasi routing Nginx API Gateway pada proyek.

---

## 🔄 Transaction Flow

Proses transaksi melibatkan komunikasi antara Transaction Service, User Service, dan Product Service.

```text
Client / Browser
       |
       v
 Nginx API Gateway
       |
       v
Transaction Service
       |
       +----------------------+
       |                      |
       v                      v
  User Service          Product Service
       |                      |
       v                      v
Validasi pengguna       Ambil informasi produk
                              |
                              v
                         Kurangi stok
       |                      |
       +----------+-----------+
                  |
                  v
         Simpan transaksi
                  |
                  v
        Transaction Database
```

Transaction Service bertindak sebagai pengatur proses transaksi.

Ketika pengguna membuat transaksi:

1. Request diterima oleh Transaction Service.
2. Transaction Service melakukan validasi pengguna melalui User Service.
3. Transaction Service meminta informasi produk kepada Product Service.
4. Product Service memproses pengurangan stok produk.
5. Transaction Service menyimpan data transaksi ke database miliknya.

Komunikasi tersebut dilakukan melalui HTTP API tanpa mengakses database service lain secara langsung.

---

## 🚀 Cara Menjalankan Project Secara Lokal

### 1. Persiapan

Pastikan perangkat sudah memiliki:

- PHP 8.2 atau lebih baru.
- Composer.
- Node.js dan npm.
- MySQL (dapat menggunakan XAMPP).
- Git.

### 2. Clone Repository

```bash
git clone <repo-url>
cd ecommerce-microservices
```

### 3. Menjalankan MySQL

Jalankan MySQL melalui XAMPP atau layanan MySQL yang digunakan.

Pastikan database untuk masing-masing service sudah dibuat dan konfigurasi koneksi database pada file `.env` sudah sesuai.

Setiap service menggunakan database MySQL terpisah.

### 4. Install Dependencies Backend

Masuk ke masing-masing direktori service dan jalankan:

```bash
composer install
```

Lakukan pada:

- `user-service`
- `product-service`
- `transaction-service`

Pastikan setiap service sudah memiliki file `.env` yang sesuai dengan konfigurasi lokal.

Jalankan migrasi database pada masing-masing service:

```bash
php artisan migrate
```

### 5. Menjalankan Backend Services

Jalankan ketiga backend service menggunakan terminal yang berbeda.

**Terminal 1 — Product Service**

```bash
cd product-service
php artisan serve --port=8001
```

**Terminal 2 — Transaction Service**

```bash
cd transaction-service
php artisan serve --port=8002
```

**Terminal 3 — User Service**

```bash
cd user-service
php artisan serve --port=8003
```

### 6. Menjalankan Frontend

Buka terminal keempat, kemudian jalankan:

```bash
cd frontend
npm install
npm run dev
```

Frontend dapat diakses melalui:

```text
http://localhost:5173
```

### 7. Alamat Lokal Services

| Komponen | Alamat |
|---|---|
| Frontend | http://localhost:5173 |
| Product Service | http://127.0.0.1:8001 |
| Transaction Service | http://127.0.0.1:8002 |
| User Service | http://127.0.0.1:8003 |

**Catatan:** Pastikan konfigurasi URL API pada frontend dan URL komunikasi antarservice sudah mengarah ke alamat lokal yang sesuai.

---

## 🐳 Menjalankan dengan Docker

Selain menjalankan service secara lokal, proyek juga dapat dijalankan menggunakan Docker Compose.

Pastikan Docker Desktop sudah aktif, kemudian jalankan perintah berikut dari direktori utama proyek:

```bash
docker compose up -d --build
```

Memeriksa container yang berjalan:

```bash
docker ps
```

Melihat log container:

```bash
docker compose logs -f
```

Menghentikan container:

```bash
docker compose down
```

---

## 🧪 Testing API dengan Postman

Contoh request untuk membuat transaksi:

**Method:**

```http
POST http://localhost/transactions/api/transactions
```

**Headers:**

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "product_id": 1,
  "quantity": 1
}
```

Ganti `TOKEN` dengan token autentikasi yang diperoleh setelah pengguna berhasil login.

---

## 📦 Database Isolation

Setiap backend service menggunakan database MySQL yang terpisah.

| Service | Database |
|---|---|
| User Service | MySQL |
| Product Service | MySQL |
| Transaction Service | MySQL |

Pemisahan database bertujuan agar setiap service dapat mengelola data dan prosesnya secara mandiri.

Tidak ada service yang mengakses database milik service lain secara langsung. Pertukaran data dilakukan melalui HTTP API.

---

## 📌 Project Status

Implementasi proyek saat ini mencakup:

- [x] React Frontend
- [x] Laravel User Service
- [x] Laravel Product Service
- [x] Laravel Transaction Service
- [x] MySQL Database
- [x] Database Isolation
- [x] REST API
- [x] User Authentication
- [x] Product Catalog
- [x] Product Category Filtering
- [x] Nginx API Gateway
- [x] Docker Multi-Container Architecture
- [x] Inter-Service Communication
- [x] Transaction Processing
- [x] Stock Reduction through Product Service

---

## 👨‍💻 Author

**Ali Fahmi Yusuf**