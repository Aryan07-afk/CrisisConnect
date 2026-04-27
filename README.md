# CrisisConnect

**Linking Help, Saving Lives**

CrisisConnect is a comprehensive full-stack disaster management and relief coordination platform. It is designed to bridge the gap between disaster victims in critical need and the relief operations team, ensuring a swift, organized, and effective emergency response. Built with a robust backend architecture and a highly responsive, premium dark-mode frontend, the platform streamlines the entire lifecycle of an emergency—from the initial SOS distress signal to the dispatch and resolution of help.

---

## 🏗 Project Architecture

This repository is built with a decoupled architecture, separating the client-side interface from the server-side API:

- **`/Crisis_frontend`**: The client-side application built with React and Vite. It features a custom design system with modern glassmorphism, responsive data visualization, and interactive disaster mapping.
- **`/Crisis_backend`**: The server-side API built with Node.js and Express. It utilizes MongoDB with Mongoose for data persistence and implements robust security middleware (Helmet, Rate Limiting, JWT authentication).

---

## 👥 User Roles & Workflows

The platform supports a role-based access control (RBAC) system with four distinct user types:

1. **Victim**
   - **Capabilities:** Can submit detailed SOS requests specifying their need (food, rescue, medical, shelter), urgency, and location.
   - **Dashboard:** Features a live status tracker to monitor request progress (Submitted -> Reviewing -> Help Assigned -> Resolved).

2. **Volunteer**
   - **Capabilities:** Ground personnel who can view assigned relief tasks, accept or reject assignments, update the status of active operations, and toggle their availability status.
   - **Dashboard:** Provides a streamlined view of active assignments and emergency requests in their vicinity.

3. **Coordinator**
   - **Capabilities:** Mid-level management responsible for reviewing incoming victim requests and dispatching them to available volunteers based on proximity and skill matching.

4. **Admin**
   - **Capabilities:** Full system oversight. Admins monitor the global disaster heatmap, track system-wide statistics (total requests, volunteer availability, resolution rates), and manage user accounts.

---

## 🌟 Key Features

- **Live Disaster Heatmap:** Real-time spatial visualization of crisis locations, clustering distress signals to help admins identify critical hot-zones using `react-leaflet`.
- **Intelligent Routing & Status Tracking:** A unified pipeline that routes victim requests through a systematic review process, ultimately linking them to capable volunteers.
- **Automated Escalation System:** A backend cron service that continuously monitors pending critical requests and flags them for immediate escalation if they remain unresolved past a threshold.
- **Premium Glassmorphic UI:** A deeply considered user interface featuring a professional dark slate aesthetic, dynamic micro-animations, and custom iconography via Google Material Symbols.
- **Secure Authentication:** Implementation of JSON Web Tokens (JWT) for secure session management, alongside bcrypt password hashing and route-level authorization guards.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Running locally or a MongoDB Atlas cluster)

### 1. Database Setup
Ensure your MongoDB instance is running. You will need the connection URI for the backend configuration.

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd Crisis_backend
npm install
```

Set up your environment variables by creating a `.env` file based on `.env.example`. Ensure you configure `MONGO_URI` and `JWT_SECRET`.

To populate the database with varied dummy data (volunteers, help requests, and victim requests) for testing the heatmap and dashboard features, run the seed script:
```bash
node seed.js
```

Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:

```bash
cd Crisis_frontend
npm install
npm run dev
```

The frontend application will be accessible at `http://localhost:3000`.

---

## 🛠 Technology Stack

**Frontend Framework & Libraries:**
- React 18 & Vite
- React Router DOM (Role-based protected routing)
- Recharts (Dashboard analytics and data visualization)
- React Leaflet (Interactive maps and heatmaps)
- Vanilla CSS (Custom design system, CSS variables, glassmorphism)

**Backend Framework & Infrastructure:**
- Node.js & Express.js
- MongoDB & Mongoose (Schema validation and compound indexing)
- JSON Web Tokens (Stateless authentication)
- Helmet.js & Express Rate Limit (Security hardening)

---

## 📖 Further Documentation

For deep dives into the specific implementation details of the frontend and backend architectures, please refer to their respective documentation:
- [Backend Documentation](./Crisis_backend/README.md)
- [Frontend Documentation](./Crisis_frontend/README.md)
