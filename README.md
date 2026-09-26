# 🚨 AI-Powered Disaster Response and Relief Management System

An AI-powered web-based platform designed to support faster, organized, and data-driven disaster response and relief management.

## 📌 About the Project

During disasters such as floods, cyclones, earthquakes, and other emergencies, managing information, shelters, relief resources, disaster reports, and response teams can be challenging.

The **AI-Powered Disaster Response and Relief Management System** provides a centralized platform where disaster-related activities can be managed in one place.

The system helps users and response teams to report disasters, manage disaster information, manage emergency shelters, track relief resources, assign responders, and generate AI-based insights.

## 🎯 Objectives

- Provide a centralized disaster management platform
- Enable users to report disasters quickly
- Manage disaster information efficiently
- Manage emergency shelters and their availability
- Track relief resources such as food, water, and medicines
- Assign responders to disaster-related tasks
- Provide AI-based insights for better decision-making
- Store and manage data using a centralized database
- Provide secure authentication and access control

## ✨ Key Features

### 🔐 User Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing
- Protected API routes

### 🚨 Disaster Reporting
Users can report disasters by providing:
- Disaster type
- Location
- Severity
- Description
- Other relevant information

### 📊 Disaster Management
- View reported disasters
- Manage disaster information
- Track disaster situations
- Support disaster response activities

### 🏠 Shelter Management
- Add and manage emergency shelters
- Store shelter details
- Track shelter capacity and availability
- Support evacuation planning

### 📦 Relief Resource Management
The system helps manage important relief resources such as:
- Food
- Water
- Medicines
- Emergency supplies
- Other essential materials

### 👥 Responder Assignment
- Manage responders
- Assign responders to disaster situations
- Track assignments
- Improve coordination during emergencies

### 🤖 AI Insights
The system includes an AI-based module to analyze disaster-related information and provide useful insights that can support disaster response and decision-making.

## 🏗️ System Architecture

User
↓
React Frontend
↓
REST API
↓
Node.js + Express Backend
↓
Prisma ORM
↓
PostgreSQL Database
↓
AI Insights Module

## 🛠️ Technologies Used

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- TypeScript
- JWT
- bcryptjs
- Express Validator
- CORS

### Database
- PostgreSQL
- Prisma ORM

### Deployment
- Frontend: Vercel
- Backend: Render

## 📁 Project Structure

AI-Disaster-Response/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   └── package.json
│
├── docker-compose.yml
├── package.json
├── render.yaml
└── README.md

## 🔄 Application Workflow

1. User registers or logs into the system.
2. User accesses the dashboard.
3. A disaster can be reported with important details.
4. Disaster information is stored in the database.
5. Response teams can manage reported disasters.
6. Emergency shelters can be managed.
7. Relief resources can be tracked and managed.
8. Responders can be assigned to disaster-related tasks.
9. AI-based insights can be used to support decision-making.

## 🔑 Environment Variables

### Backend

Create a `.env` file inside the `backend` folder:

PORT=5000
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

### Frontend

Create a `.env` file inside the `frontend` folder:

VITE_API_URL=http://localhost:5000/api

> Never upload `.env` files containing passwords, database URLs, API keys, or other secrets to GitHub.

## 🚀 Run Locally

### Clone the repository

git clone https://github.com/jayapriya-12/AI-Disaster-Response.git

cd AI-Disaster-Response

### Install frontend dependencies

cd frontend
npm install

### Install backend dependencies

cd ../backend
npm install

### Setup Prisma

npx prisma generate
npx prisma db push

### Start backend

npm run dev

Backend:

http://localhost:5000

Health Check:

http://localhost:5000/api/health

### Start frontend

Open another terminal:

cd frontend
npm run dev

Frontend:

http://localhost:5173

## 🔗 API Modules

The backend contains APIs for:

- `/api/auth`
- `/api/users`
- `/api/disasters`
- `/api/reports`
- `/api/shelters`
- `/api/resources`
- `/api/assignments`
- `/api/ai`

Health Check:

`GET /api/health`

Example response:

{
  "status": "OK",
  "message": "AI Disaster Response Backend is running"
}

## 🌐 Deployment

### Frontend

The frontend is deployed using Vercel.

The frontend communicates with the deployed backend using:

VITE_API_URL=https://your-backend-url.onrender.com/api

### Backend

The backend is deployed using Render.

Required environment variables:

DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend-url.vercel.app

## 🔒 Security

The system uses:

- JWT authentication
- bcrypt password hashing
- Protected API routes
- Input validation
- CORS configuration
- Environment variables for sensitive information

## 🔮 Future Enhancements

- Real-time disaster alerts
- Live disaster maps
- GPS-based location tracking
- Weather API integration
- SMS and email emergency notifications
- Advanced AI-based disaster prediction
- AI-based resource optimization
- Real-time responder tracking
- Multi-language support
- Mobile application
- Integration with government emergency services

## 🎓 Project Information

**Project Title:** AI-Powered Disaster Response and Relief Management System

**Domain:** Artificial Intelligence, Disaster Management, Web Application

**Frontend:** React + TypeScript

**Backend:** Node.js + Express + TypeScript

**Database:** PostgreSQL

**ORM:** Prisma

**Deployment:** Vercel + Render

## 📄 License

This project is developed for educational and project demonstration purposes..

👩‍💻 Developed By
Jayapriya R

B.Tech – Computer Science and Business Systems (CSBS)

VSB Engineering College, Karur

Academic Year: 2026–2027
