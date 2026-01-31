# E-Commerce Microservices Project 🚀
Proyek ini adalah implementasi arsitektur microservices menggunakan **Laravel**, **Docker**, dan **Nginx API Gateway**. Dibangun dalam waktu 14 hari untuk mendalami komunikasi antar service dan database isolation.

## 🏗️ Tech Stack
- **Framework:** Laravel 11
- **Orchestration:** Docker Compose
- **Gateway:** Nginx
- **Database:** MySQL (User & Order), PostgreSQL (Product)
- **Auth:** JWT (JSON Web Token)

## 🗺️ Roadmap Progres

### MINGGU 1: Setup Infrastructure & User Service
- [x] **Hari 1:** Network Architecture & Docker Master. (Setup Nginx Gateway & Multi-DB)
- [x] **Hari 2:** User Service (Auth Center). (Setup Laravel User Service & Migration)
- [ ] **Hari 3:** JWT Centralization.
- [ ] **Hari 4:** Product Service Setup.
- [ ] **Hari 5:** API Gateway Routing.
- [ ] **Hari 6:** Service Communication (Internal Guzzle).
- [ ] **Hari 7:** Review & Docker Optimization.

### MINGGU 2: Order Service & Messaging Broker
- [ ] **Hari 8:** Order Service Foundation.
- [ ] **Hari 9:** Logic: Check Product Availability.
- [ ] **Hari 10:** Introduction to RabbitMQ/Redis Queue.
- [ ] **Hari 11:** Event-Driven: Update Stock.
- [ ] **Hari 12:** Database Isolation Test.
- [ ] **Hari 13:** Unified Logging.
- [ ] **Hari 14:** End-to-End Testing.

## 🚀 Cara Menjalankan
1. Clone repository ini.
2. Jalankan `docker compose up -d --build`.
3. Akses API melalui port 80 (Gateway).