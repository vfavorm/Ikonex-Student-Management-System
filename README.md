# Ikonex Student Management System

> A full-stack web application for **Ikonex Academy** that manages class streams, students, subjects, scores, and generates automated report cards and performance reports.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Default Credentials](#default-credentials)
- [Grading Scale](#grading-scale)
- [Submission Details](#submission-details)

---

## Overview

The **Ikonex Student Management System** is a web-based platform built to streamline academic operations at Ikonex Academy. It covers the full lifecycle from class stream creation through student registration, subject assignment, score recording, and automated results processing — including PDF report card generation for individual students and entire class streams.

---

## Features

###  Class Stream Management
- Create class streams (e.g., Form 1A, Form 1B, Form 1C)
- View all class streams with assigned student counts
- View details of a single class stream including enrolled students
- Edit and delete class streams

###  Student Management
- Register students and assign them to a class stream
- Edit student information (name, admission number, class, date of birth)
- Delete student records
- View a single student's full details
- View all students with search/filter functionality
- View students belonging to a specific class stream

### Subject Management
- Create and manage subjects offered by the school (name + code)
- Assign subjects to specific class streams
- View all subjects
- Edit and delete subject information

### Student Assessment & Scoring
- Record **examination scores** and **continuous assessment (CA)** scores per student per subject
- Automatic total score calculation (Exam + CA)
- Auto-assigned grade based on configurable grading scales
- Edit and update existing student scores
- View individual student performance by subject
- View class-wide performance for a selected subject
- Duplicate score submission prevention (unique constraint per student–subject pair)

### Results Processing
- Calculate total marks obtained by each student across all subjects
- Calculate average scores per student
- Determine grades based on the configurable grading scale (A–F)
- Calculate subject positions and overall class positions
- Automatically rank students within a class stream based on total performance

### Reporting
- Generate an **individual PDF Report Card** for each student showing all subject scores, grades, totals, averages, and class position
- Generate a **PDF class performance report** summarising all students' results for a selected class stream

### Authentication
- JWT-based login/logout
- Protected API routes via middleware

---

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Frontend   | React.js (Create React App), Vanilla CSS |
| Backend    | Node.js + Express.js               |
| Database   | MySQL                              |
| Auth       | JSON Web Tokens (JWT) + bcryptjs   |
| PDF Generation | PDFKit                         |
| Version Control | Git / GitHub                  |
| Dev Server | nodemon                            |

---

## Project Structure

```
Ikonex-Student-Management-System/
├── Backend/
│   ├── config/
│   │   ├── database.js        # MySQL connection pool
│   │   └── schema.sql         # Database schema & seed data
│   ├── controllers/           # Route handler logic
│   │   ├── authController.js
│   │   ├── classStreamController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── scoreController.js
│   │   └── resultController.js
│   ├── middleware/            # JWT auth middleware
│   ├── models/                # Database query models
│   │   ├── ClassStream.js
│   │   ├── ClassSubject.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   ├── Score.js
│   │   ├── Result.js
│   │   └── User.js
│   ├── routes/                # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── classStreamRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── scoreRoutes.js
│   │   └── resultRoutes.js
│   ├── utils/
│   │   └── logger.js
│   ├── reports/               # Generated PDF output directory
│   ├── .env                   # Environment variables
│   ├── server.js              # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Home.js
    │   │   ├── ClassStreams.js
    │   │   ├── Students.js
    │   │   ├── Subjects.js
    │   │   ├── Scores.js
    │   │   └── Results.js
    │   ├── services/          # Axios API service modules
    │   ├── components/        # Shared UI components
    │   ├── styles/            # Global & page styles
    │   ├── App.js             # Root component & navbar
    │   └── App.css            # Global stylesheet
    └── package.json
```

---

## Database Design

The system uses **MySQL** with the following schema:

```
users              – Admin accounts (JWT auth)
class_streams      – School class groups (e.g., Form 1A)
subjects           – School subjects (name + code)
class_subjects     – Many-to-many: subjects assigned to class streams
students           – Enrolled students linked to a class stream
scores             – Per-student, per-subject exam + CA scores
grading_scales     – Configurable grade bands (A–F)
```

**Key relationships:**
- A `student` belongs to one `class_stream`
- A `class_stream` can have many `subjects` via `class_subjects`
- A `score` is unique per `student–subject` pair (prevents duplicates)
- Grades are derived by joining `scores` against `grading_scales`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) v8+
- npm

---

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ikonex_student_management
PORT=8000
JWT_SECRET=your_jwt_secret_key
```

---

### Database Setup

1. Open your MySQL client and run the schema script:

```bash
mysql -u root -p < Backend/config/schema.sql
```

This will:
- Create the `ikonex_student_management` database
- Create all required tables
- Seed the default grading scale (A–F)
- Insert a default admin user

---

### Running Locally

#### 1. Backend

```bash
cd Backend
npm install
npm run dev
# Server starts on http://localhost:8000
```

#### 2. Frontend

```bash
cd frontend
npm install
npm start
# App opens on http://localhost:3000
```

---

## API Reference

All API routes are prefixed with `/api`.

| Method | Endpoint                              | Description                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/api/auth/login`                     | Login and receive JWT                |
| GET    | `/api/class-streams`                  | List all class streams               |
| POST   | `/api/class-streams`                  | Create a class stream                |
| GET    | `/api/class-streams/:id`              | Get class stream details             |
| PUT    | `/api/class-streams/:id`              | Update a class stream                |
| DELETE | `/api/class-streams/:id`              | Delete a class stream                |
| GET    | `/api/students`                       | List all students                    |
| POST   | `/api/students`                       | Register a student                   |
| GET    | `/api/students/:id`                   | Get student details                  |
| PUT    | `/api/students/:id`                   | Update student info                  |
| DELETE | `/api/students/:id`                   | Delete a student                     |
| GET    | `/api/subjects`                       | List all subjects                    |
| POST   | `/api/subjects`                       | Create a subject                     |
| PUT    | `/api/subjects/:id`                   | Update a subject                     |
| DELETE | `/api/subjects/:id`                   | Delete a subject                     |
| POST   | `/api/subjects/:id/assign`            | Assign subject to class stream       |
| GET    | `/api/scores`                         | Get scores (filterable by student/subject) |
| POST   | `/api/scores`                         | Record a score                       |
| PUT    | `/api/scores/:id`                     | Update a score                       |
| GET    | `/api/results/:classStreamId`         | Get results for a class stream       |
| GET    | `/api/results/student/:studentId`     | Get individual student results       |
| GET    | `/api/results/:classStreamId/pdf`     | Download class PDF report            |
| GET    | `/api/results/student/:studentId/pdf` | Download student PDF report card     |
| GET    | `/api/health`                         | Backend health check                 |


## Default Credentials

A demo admin account is seeded with the schema:

| Field    | Value             |
|----------|-------------------|
| Email    | `user@gmail.com`  |
| Password | `password`    |


---

## Grading Scale

| Grade | Score Range  |
|-------|-------------|
| A     | 80 – 100    |
| B     | 70 – 79.99  |
| C     | 60 – 69.99  |
| D     | 50 – 59.99  |
| F     | 0  – 49.99  |

> The grading scale is stored in the `grading_scales` table and can be updated directly in the database to suit institutional requirements.

