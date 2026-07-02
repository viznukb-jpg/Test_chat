# Live Chat Project

This is a real-time chat application built with Next.js (App Router), NestJS, PostgreSQL, Redis, and WebSockets.

## 🚀 Quick Start for Reviewers

This repository includes everything you need to run the project instantly. The `.env` files and an initial database dump (`init.sql`) are intentionally included in the repo so you don't have to configure anything manually.

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+ recommended)

### 1. Start the Databases
In the root of the project, run:
```bash
docker-compose up -d
```
*Note: Postgres will automatically execute `init.sql` on its first boot, creating the tables and filling them with test data (users, rooms, messages).*

### 2. Start the Backend (NestJS)
Open a new terminal and run:
```bash
cd server
npm install
npm run start:dev
```
The backend will run on `http://localhost:4000`.

### 3. Start the Frontend (Next.js)
Open another terminal and run:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`.

---

## 🧪 Test Accounts
The database is already pre-filled. You can log in with any of the generated users:
- **Email:** `user1@test.com` (up to `user10@test.com`)
- **Password:** `password123`

You can open `http://localhost:3000` in two different browsers (or one incognito) to test the real-time WebSocket chat and room features.

## Architecture Highlights
- **Auth:** JWT (Access + Refresh tokens). Access tokens (15m) are whitelisted in Redis. Refresh tokens (7d) are stored in Postgres. Client-side Axios interceptor seamlessly refreshes the session.
- **WebSockets:** Socket.io integrated with NestJS Gateways. Includes muting (with local time formatting) and kicking features.
- **Global Error Boundaries:** Custom 404 and Error pages in Next.js App Router.
- **State Management:** Zustand for global frontend state (Auth).
