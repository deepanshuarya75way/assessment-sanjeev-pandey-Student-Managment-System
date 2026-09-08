# 🎓 Student Management System (SMS)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern, full-stack Academic & Student Management System engineered with the **MERN** stack (MongoDB, Express, React, Node.js). Features strict role-based access control (RBAC), real-time attendance tracking, exam & marks ledger, campus notices, global instant search, and a refined, eye-soothing slate dark UI.

---

## 🌟 Key Highlights & Features

### 🔐 1. Role-Based Access Control (RBAC) & Security
- **Admin**: Complete system sovereignty — manage student directory, faculty roster, degree courses, curriculum subjects, attendance overrides, marks calibration, and system-wide announcements.
- **Teacher**: Take class attendance by date and session, enter/calibrate student exam marks with auto-calculated grades & percentages, and post academic notices.
- **Student Privacy & Self-Service**: Strictly guarded — students have private access to their own academic records, grades, and attendance stats via `/api/students/me`, and cannot view other students' profiles or directory listings.
- **JWT & bcryptjs Authentication**: Secure password hashing with HTTP header Bearer token verification and auto-logout on token expiration.

### 🎨 2. Refined "Little Dark" Modern UI
- **Eye-Soothing Soft-Dark Palette**: Designed with deep midnight-slate tones (`#0e1524`, `#151f32`, `#22324b`) avoiding harsh pure black while maintaining sharp, accessible contrast.
- **Vibrant Action Accents**: Eye-catching amber/gold buttons for editing and actions (`#fbbf24`), vibrant blue (`#3b82f6`) for primary interactions, and semantic indicators (Emerald Green, Amber, Coral Red).
- **Interactive Global Search**: Instant spotlight search with keyboard navigation (`↑`, `↓`, `Enter`, `Esc`) to jump directly to any student, teacher, or course.
- **Responsive Layout**: Collapsible sidebar, mobile navigation drawer, interactive SVG chart widgets, and real-time toast notifications.

### 📊 3. Academic & Operational Modules
- **Student Directory**: Paginated, searchable student profiles with enrollment numbers, course allocations, semester tracking, and contact details.
- **Faculty Management**: Departmental teacher rosters with assigned subjects and courses.
- **Programs & Course Curriculum**: Multi-semester academic courses and core/elective subject mapping.
- **Attendance Tracker**: Session-wise attendance marking (Present, Absent, Late) with automatic percentage calculations and low-attendance warnings.
- **Grades & Marks Ledger**: Internal assessments and semester final exams with automatic grade determination (A+, A, B, C, D, F) and SGPA/CGPA support.
- **Campus Announcements**: Urgent, exam, event, and general notices with target audience filtering.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Lucide/SVG Icons, Modern Pure CSS Design System |
| **Backend** | Node.js, Express.js REST API, JWT (`jsonwebtoken`), `bcryptjs`, CORS |
| **Database** | MongoDB with Mongoose ODM (Schema validation, indexes, virtuals, cascade checks) |
| **Tooling & Build** | Vite Build Pipeline, ES Modules, PostCSS, Concurrently |

---

## 📁 Repository Structure

```text
Student-Managment-System/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB database connection
│   │   ├── controllers/     # Request handlers & HTTP responses
│   │   ├── middleware/      # JWT auth, RBAC authorization, error handlers
│   │   ├── models/          # Mongoose models (Student, Teacher, Course, Attendance, etc.)
│   │   ├── routes/          # Express REST API routes
│   │   ├── services/        # Reusable business logic layer
│   │   ├── utils/           # Token generation, grade calculation formulas
│   │   └── server.js        # Server entry point & middleware setup
│   ├── .env.example         # Backend environment templates
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets & branding crest
│   │   ├── components/      # Reusable UI (Modals, GlobalSearch, StatCards, Charts)
│   │   ├── context/         # React Contexts (AuthContext, ToastContext, ThemeContext)
│   │   ├── pages/           # Application views (Dashboard, Students, Marks, Attendance, etc.)
│   │   ├── services/        # Axios API clients
│   │   ├── index.css        # Design tokens, variables & typography
│   │   ├── App.jsx          # Protected route declarations
│   │   └── main.jsx         # React DOM mount point
│   ├── .env.example         # Frontend environment templates
│   ├── vite.config.js       # Vite development & build configuration
│   └── package.json
├── .gitignore               # Excludes node_modules, .env, build output
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local Community Server running on `mongodb://localhost:27017` or MongoDB Atlas URI)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/SANJEEVHEMISPHERE/Student-Managment-System.git
cd Student-Managment-System
```

---

### 2. Configure Backend

```bash
cd backend
npm install
```

Create `.env` inside `backend/` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student_management_db
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secure_jwt_secret_key_change_me
JWT_EXPIRES_IN=7d
```

Start the backend server:
```bash
npm run dev
```
> Backend API will start on: **`http://localhost:5000`**  
> Health Check endpoint: **`http://localhost:5000/api/health`**

---

### 3. Configure Frontend

Open a new terminal window:
```bash
cd frontend
npm install
```

Create `.env` inside `frontend/` (or copy from `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start Vite dev server:
```bash
npm run dev
```
> Open your browser at: **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

You can test the different role-based views using the pre-configured accounts:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Admin** | `admin@sms.edu` | `password123` | Full access across all modules & settings |
| **Teacher** | `teacher@sms.edu` | `password123` | Attendance entry, Marks entry, Announcements |
| **Student** | `student@sms.edu` | `password123` | Personal profile, attendance stats, own grades |

---

## 📡 REST API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `GET` | `/api/students` | Admin, Teacher | List all students with search & pagination |
| `GET` | `/api/students/me` | Student | Fetch logged-in student's personal profile |
| `POST` | `/api/students` | Admin | Enroll a new student |
| `GET` | `/api/attendance` | Authenticated | Query class attendance records |
| `POST` | `/api/attendance` | Admin, Teacher | Submit single/bulk attendance session |
| `GET` | `/api/marks` | Authenticated | Retrieve semester marks & report card |
| `POST` | `/api/marks` | Admin, Teacher | Enter student examination marks |
| `GET` | `/api/announcements` | Authenticated | View campus circulars |
| `GET` | `/api/search` | Authenticated | Instant multi-entity global spotlight search |

---

## 📄 License
Distributed under the **MIT License**. Feel free to use and customize for your institution or learning project.
