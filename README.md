# AI-Powered Disaster Response and Relief Management System

A production-ready full-stack web application designed for emergency disaster reporting, responder assignment, shelter occupancy tracking, relief supply management, and AI-assisted severity classification.

---

## 🌟 Features Overview

- **Login First & Auth Flow**: Initial load directs immediately to `/login`. Secure authentication powered by JWT and bcrypt password hashing.
- **Role-Based Access Control (RBAC)**:
  - **ADMIN**: Monitor all operations, manage disasters, dispatch responders, verify citizen reports, manage shelters and relief resources.
  - **RESPONDER**: View assigned rescue tasks, update mission status (`Assigned` -> `In Progress` -> `Completed`), log operational field notes.
  - **USER**: Report disaster incidents, track report verification status, locate nearby shelters, view active disaster alerts.
- **AI Intelligence Hub**:
  - **Severity Prediction Engine**: Analyzes report descriptions and emergency keywords to output severity (`Low`, `Medium`, `High`, `Critical`) with confidence scores.
  - **Report Prioritization Matrix**: Ranks pending reports based on risk levels and keyword triggers.
  - **Relief Supply Allocator**: Calculates recommended water, food, medical kit, tent, and blanket allocations based on affected population size.
- **Interactive Leaflet Maps**: Real-time geolocation pin plotting for disaster events, emergency shelters, and responder mission locations.
- **Shelter & Relief Inventory**: Capacity progress indicators, live occupancy controls, and inventory stock tracking.

---

## 🏗️ Architecture

```text
                 ┌──────────────────────────────────────┐
                 │       FRONTEND (Vite + React)        │
                 │ TypeScript, Tailwind CSS, Lucide,   │
                 │ React Router, Axios, Leaflet Maps    │
                 └──────────────────┬───────────────────┘
                                    │
                              Axios HTTP / API
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │      BACKEND (Node.js + Express)     │
                 │ TypeScript, JWT Auth, Express Validator│
                 │ Controller-Service Architecture      │
                 └──────────────────┬───────────────────┘
                                    │
                             Prisma ORM
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │       POSTGRESQL / SQLITE DATABASE   │
                 │ Users, Disasters, Reports, Shelters,  │
                 │ Relief Resources, Assignments        │
                 └──────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, Leaflet / React-Leaflet
- **Backend**: Node.js, Express.js, TypeScript, REST APIs, JWT, BcryptJS, Express Validator, Cors
- **Database**: PostgreSQL (Neon / Supabase compatible) or SQLite (Zero-config local mode), Prisma ORM
- **Deployment**: Vercel (Frontend), Render (Backend), Docker Compose

---

## 📁 Monorepo Folder Structure

```text
AI-Disaster-Response/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI cards, badges, modals & maps
│   │   ├── context/          # AuthContext for session management
│   │   ├── layouts/          # MainLayout with header & responsive sidebar
│   │   ├── pages/            # Login, Register, Dashboard, Disasters, Shelters, AI
│   │   ├── services/         # Axios centralized API client
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Router with ProtectedRoute guards
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/
│   ├── src/
│   │   ├── config/           # Prisma client DB connection
│   │   ├── controllers/      # Auth, Disaster, Report, Shelter, Resource, AI
│   │   ├── middleware/       # AuthMiddleware & ErrorHandler
│   │   ├── routes/           # REST API endpoints
│   │   ├── utils/            # JWT helpers
│   │   └── server.ts         # Express server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma models
│   │   └── seed.ts           # Admin, Responders, & sample data seed
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## 🚀 Quick Local Setup Guide

### 1. Install Dependencies

In the root directory, run:

```bash
npm run install:all
```

Or install in each directory individually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Setup Database & Seed Data

Generate Prisma client and populate database with default records:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

#### Default Seed Accounts for Testing:
- **Admin**: `admin@example.com` / `AdminPassword123!`
- **Responder**: `responder1@disaster.gov` / `Responder123!`
- **Citizen User**: `user@example.com` / `User12345!`

*(Note: The login screen also features quick 1-click auto-fill buttons for instant testing).*

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will start on: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 4. Start Frontend Client

In a separate terminal window:

```bash
cd frontend
npm run dev
```

Frontend will start on: `http://localhost:5173`

---

## 📡 REST API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | System status check |
| **POST** | `/api/auth/register` | Public | Register new user (USER role only) |
| **POST** | `/api/auth/login` | Public | Authenticate user & return JWT |
| **GET** | `/api/auth/me` | Authenticated | Fetch current user session |
| **POST** | `/api/auth/logout` | Authenticated | End active session |
| **GET** | `/api/disasters` | Authenticated | List all disasters with filters |
| **POST** | `/api/disasters` | Admin | Create new disaster event |
| **PUT** | `/api/disasters/:id` | Admin/Responder | Update disaster details/status |
| **GET** | `/api/reports` | Authenticated | List disaster reports |
| **POST** | `/api/reports` | Authenticated | Submit new emergency report |
| **PUT** | `/api/reports/:id/verify`| Admin/Responder | Mark report as Verified or Rejected |
| **GET** | `/api/shelters` | Authenticated | List all shelters and occupancy |
| **POST** | `/api/shelters` | Admin | Add new shelter |
| **PUT** | `/api/shelters/:id` | Admin/Responder | Update shelter details/occupancy |
| **GET** | `/api/resources` | Authenticated | View relief supply inventory |
| **POST** | `/api/resources` | Admin | Add relief resource item |
| **GET** | `/api/assignments` | Admin/Responder | View responder dispatch board |
| **POST** | `/api/assignments` | Admin | Dispatch responder to incident |
| **PUT** | `/api/assignments/:id` | Admin/Responder | Update response status log |
| **POST** | `/api/ai/predict-severity`| Authenticated | AI Severity Prediction Engine |
| **GET** | `/api/ai/prioritize-reports`| Authenticated| AI Report Prioritization Ranking |
| **POST** | `/api/ai/recommend-relief`| Authenticated | AI Relief Supply Allocator |

---

## 🌐 Production Deployment Guide

### Backend Deployment (Render)

1. Connect your repository to **Render**.
2. Select **Web Service** and choose the `backend` subfolder as Root Directory.
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Set Environment Variables:
   - `PORT`: `5000`
   - `DATABASE_URL`: Your PostgreSQL connection string (Neon / Supabase)
   - `JWT_SECRET`: A secure secret string
   - `FRONTEND_URL`: Your deployed Vercel frontend URL

### Frontend Deployment (Vercel)

1. Connect your repository to **Vercel**.
2. Set Root Directory to `frontend`.
3. Set Framework Preset to **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL`: `https://YOUR-BACKEND-URL.onrender.com/api`
5. Deploy.

---

## 📋 Verification & Testing Checklist

- [x] Login page is the default initial page on app launch.
- [x] Public registration forces `USER` role and prohibits unauthorized Admin creation.
- [x] Seed script initializes Admin (`admin@example.com`), Responders, Shelters, and Disasters.
- [x] JWT token is attached via Axios interceptor on every API call.
- [x] Admin dashboard presents KPI cards, pending reports queue, and interactive map.
- [x] User dashboard presents submitted reports status and nearby shelter locator.
- [x] Responder dashboard presents assigned missions and status updater.
- [x] Disaster severity prediction engine analyzes report description and outputs risk levels.
- [x] Full build verification (`npm run build` for backend and frontend) compiles cleanly.
