# 🛒 E-Commerce Microservices Project

Proyek ini adalah implementasi arsitektur **microservices sederhana** menggunakan **Laravel**, **Docker**, dan **Nginx API Gateway**.
Setiap service memiliki **database terpisah (database isolation)** dan berkomunikasi melalui **HTTP API internal Docker network**.

Project ini dibuat sebagai latihan memahami:

* Docker multi-container architecture
* API Gateway routing
* Inter-service communication
* Database isolation pada microservices

---

# 🏗️ Tech Stack

* **API Gateway:** Nginx
* **Framework:** Laravel 12 (PHP 8.2)
* **Containerization:** Docker & Docker Compose

### Services

* **User Service:** Laravel + MySQL
* **Product Service:** Laravel + PostgreSQL
* **Transaction Service:** Laravel + MySQL

---

# 🧱 Architecture Overview

```
Client (Postman / Browser)
        ↓
     Nginx Gateway
        ↓
 ┌───────────────┬───────────────┬────────────────┐
 │ User Service  │ Product Service │ Transaction Service │
 │ MySQL         │ PostgreSQL      │ MySQL              │
 └───────────────┴───────────────┴────────────────┘
```

Transaction Service melakukan komunikasi HTTP ke:

* User Service → validasi token
* Product Service → ambil data produk & kurangi stok

---

# 🔌 API Endpoints (via Gateway)

Semua request melalui:

```
http://localhost
```

| Service     | Endpoint                         | Method | Description           |
| ----------- | -------------------------------- | ------ | --------------------- |
| User        | `/users/api/...`                 | ALL    | User & Authentication |
| Product     | `/products/api/products`         | GET    | List produk           |
| Product     | `/products/api/products`         | POST   | Tambah produk         |
| Product     | `/products/api/products/{id}`    | GET    | Detail produk         |
| Transaction | `/transactions/api/transactions` | POST   | Buat transaksi        |
| Transaction | `/transactions/api/transactions` | GET    | List transaksi        |

---

# 🔄 Transaction Flow

Alur transaksi:

```
Client
  ↓
Gateway
  ↓
Transaction Service
  ↓
Validasi User → User Service
Ambil Produk → Product Service
Kurangi Stok → Product Service
Simpan Transaksi → Transaction DB
```

---

# 🚀 Cara Menjalankan Project

### 1. Clone repository

```bash
git clone <repo-url>
cd ecommerce-microservices
```

### 2. Jalankan Docker

```bash
docker compose up -d --build
```

### 3. Cek container

```bash
docker ps
```

---

# 🧪 Testing via Postman

### Create Transaction

```
POST http://localhost/transactions/api/transactions
```

Header:

```
Authorization: Bearer TOKEN
Content-Type: application/json
```

Body:

```json
{
  "product_id": 1,
  "quantity": 1
}
```

---

# 📦 Database Isolation

Setiap service menggunakan database terpisah:

| Service     | Database   |
| ----------- | ---------- |
| User        | MySQL      |
| Product     | PostgreSQL |
| Transaction | MySQL      |

Tidak ada service yang mengakses database service lain secara langsung.

---

# 📌 Status Project

Versi saat ini:

* Docker multi-service architecture ✔
* API Gateway routing ✔
* Inter-service communication ✔
* Transaction → reduce stock ✔
* Database isolation ✔

---

# 👨‍💻 Author
Ali Fahmi Yusuf
