# CrisisConnect 🚨

> **Linking Help, Saving Lives**

CrisisConnect is a full-stack disaster management and relief coordination platform. It connects people in need of urgent help (victims) with available volunteers and coordinators, ensuring a swift and organized emergency response.

---

## 🏗 Project Structure

This repository contains both the frontend and backend applications:

- **[`/Crisis_frontend`](./Crisis_frontend)**: React + Vite application for the user interface.
- **[`/Crisis_backend`](./Crisis_backend)**: Node.js + Express backend API and MongoDB models.

---

## 👥 User Roles

1. **Victim**: Can submit SOS requests (food, rescue, medical, etc.) and track their status.
2. **Volunteer**: Can view assigned relief tasks, accept/reject assignments, update task status, and manage their availability.
3. **Coordinator**: Manages requests, assigns volunteers to tasks, and monitors the dashboard.
4. **Admin**: Full system access, including user management and overall platform monitoring.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)

### 1. Database Setup
Ensure MongoDB is running on your system, or have your MongoDB Atlas URI ready.

### 2. Backend Setup
```bash
cd Crisis_backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and enter your MONGO_URI and a secure JWT_SECRET

# Run the server (starts on port 5000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Crisis_frontend

# Install dependencies
npm install

# Run the frontend (starts on port 3000)
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 🛠 Technology Stack

**Frontend:**
- React (with Vite)
- User Authentication & Role-based Routing
- Recharts for data visualization
- Custom CSS Design System (Glassmorphism & Dark Mode Aesthetic)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for secure authentication
- Helmet & Express Rate Limit for API security

---

## 📖 Component Documentation

For more detailed information about the frontend and backend architectures, please refer to their respective README files:
- [Backend Documentation](./Crisis_backend/README.md)
- [Frontend Documentation](./Crisis_frontend/README.md)
