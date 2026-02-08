# 🛒 E-Commerce Microservices Project

Proyek ini adalah implementasi arsitektur microservices modern menggunakan **Laravel 11**, **Docker**, dan **Nginx API Gateway**. Proyek ini mendemonstrasikan pemisahan database (*Database Isolation*), komunikasi antar service, dan manajemen container.

## 🏗️ Tech Stack & Architecture
- **API Gateway:** Nginx (Port 80)
- **Framework:** Laravel 11 (PHP 8.2)
- **Containerization:** Docker & Docker Compose
- **Service A (User):** Laravel + MySQL
- **Service B (Product):** Laravel + PostgreSQL
- **Service C (Transaction):** Laravel + MySQL + Inter-service Communication

## 🗺️ Roadmap & Progress

### 🏗️ MINGGU 1: Infrastructure & Core Services
- [x] **Hari 1:** Network Architecture & Docker Master. (Setup Nginx Gateway & Multi-DB).
- [x] **Hari 2:** User Service Setup. (Setup Laravel, MySQL, & Migration).
- [x] **Hari 3:** Product Service Setup. (Implementation with **PostgreSQL**).
- [x] **Hari 4:** API Gateway Routing. (Nginx Configuration for Multi-service).
- [x] **Hari 5:** Transaction Service & Synchronous Communication. (Fetch Product Price via HTTP).
- [ ] **Hari 6:** JWT Centralization (Auth Security).
- [ ] **Hari 7:** Review & Docker Optimization.

### 🚀 MINGGU 2: Messaging Broker & Testing
- [ ] **Hari 8:** Introduction to RabbitMQ/Redis Queue.
- [ ] **Hari 9:** Event-Driven: Update Stock (Asynchronous).
- [ ] **Hari 10:** Logic: Check User Validity.
- [ ] **Hari 11:** Error Handling & Circuit Breaker.
- [ ] **Hari 12:** Database Isolation Test.
- [ ] **Hari 13:** Unified Logging.
- [ ] **Hari 14:** End-to-End Testing (Postman Collection).

## 🔌 API Endpoints (Gateway)
Semua request melalui port **80** dan diteruskan ke service terkait:

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| **User** | `/users/api/...` | ALL | Manajemen User & Auth |
| **Product** | `/products/api/products` | GET/POST | Katalog Produk (Postgres) |
| **Transaction** | `/transactions/api/transactions` | GET/POST | Transaksi (Auto-check Price) |

## 🚀 Cara Menjalankan
1. **Clone Repository:**
   ```bash
   git clone <repo-url>
   cd ecommerce-microservices