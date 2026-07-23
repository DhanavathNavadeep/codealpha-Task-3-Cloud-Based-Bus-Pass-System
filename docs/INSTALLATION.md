# Local Installation & Quickstart Guide

This guide explains how to set up and run the **Cloud-Based Bus Pass Management System** on your local machine using Python Flask and React.js, either directly or via Docker Compose.

---

## System Requirements

- **Python**: v3.10 or higher
- **Node.js**: v18 or higher & `npm`
- **Docker & Docker Compose**: (Optional, recommended for production simulation)
- **Git**

---

## Method 1: Local Development Setup (Without Docker)

### Step 1: Clone Repository
```bash
git clone https://github.com/DhanavathNavadeep/Task_3_Model_Fairness_Bias_Explainability.git
cd Task-3-Cloud-Based-Bus-Pass-System
```

### Step 2: Setup & Start Backend (Flask REST API)
```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend dev server
python run.py
```
> The Flask API will start on **`http://localhost:5000`** with SQLite automatically initialized and seeded with default routes and demo credentials.

### Step 3: Setup & Start Frontend (React.js + Vite)
Open a new terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```
> The React dashboard will be available at **`http://localhost:3000`**.

---

## Method 2: Docker Compose Setup (Full Stack Containerization)

To launch the complete stack (React frontend, Flask backend, PostgreSQL database, and Redis cache) with a single command:

```bash
# From the project root directory
docker-compose up --build
```

Access the services:
- **Frontend Dashboard**: `http://localhost` (Port 80)
- **Backend REST API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

---

## Default Login Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@buspass.com` | `Admin@123` | Full admin management, pass verification, route CRUD, analytics |
| **User** | `user@buspass.com` | `User@123` | Apply pass, fare calculator, QR view, PDF download |
