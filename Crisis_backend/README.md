# CrisisConnect — Frontend (React + Vite)

Production-grade React frontend for the CrisisConnect disaster management platform.
Built with Vite, React Router v6, Axios, and Recharts. Zero UI library dependencies — fully custom design system.

---

## 📁 Project Structure

```
crisisconnect-frontend/
├── index.html
├── vite.config.js
├── package.json
│
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx                   # Router + auth guards
    │
    ├── api/
    │   ├── axios.js              # Axios instance (JWT + auto-logout)
    │   └── index.js              # All API call functions
    │
    ├── context/
    │   └── AuthContext.jsx       # Global auth state
    │
    ├── styles/
    │   └── global.css            # Full design system (tokens, layout, components)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.jsx     # Shell wrapper with Outlet
    │   │   ├── Sidebar.jsx       # Navigation sidebar
    │   │   └── PageHeader.jsx    # Topbar with title + actions
    │   └── common/
    │       ├── Badge.jsx         # Status/priority badges
    │       ├── Loader.jsx        # Spinner components
    │       └── Modal.jsx         # Reusable modal wrapper
    │
    └── pages/
        ├── auth/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ProfilePage.jsx
        ├── dashboard/
        │   └── DashboardPage.jsx  # Stats, charts, activity feed
        ├── requests/
        │   ├── RequestsPage.jsx   # List with filters
        │   ├── RequestForm.jsx    # Create / edit form
        │   └── RequestDetail.jsx  # Full detail + notes
        ├── volunteers/
        │   ├── VolunteersPage.jsx # Card grid with availability toggle
        │   └── VolunteerDetail.jsx
        └── assignments/
            └── AssignmentsPage.jsx # Timeline view + assign modal
```

---

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:5000)
npm run dev

# Build for production
npm run build
```

> Make sure the backend is running on port 5000 before starting the frontend.

---

## 🔐 Role-Based UI

| Role        | Pages Visible                                              |
|-------------|------------------------------------------------------------|
| admin       | Dashboard (full stats), Requests, Volunteers, Assignments, Profile |
| coordinator | Dashboard (full stats), Requests, Volunteers, Assignments, Profile |
| volunteer   | Dashboard (welcome), Requests (own), Assignments (own), Profile |

---

## 🎨 Design System

- **Fonts**: Syne (headings) + Outfit (body) + DM Mono (labels/code)
- **Theme**: Dark command-center aesthetic — deep navy/slate with amber/orange accents
- **Colors**: CSS custom properties — no hardcoded hex values in components
- **No UI library**: Pure CSS design system in `global.css`
- **Bandwidth-efficient**: No icon library, no heavy dependencies, minimal bundle size

---

## 📦 Dependencies

| Package          | Purpose                          |
|------------------|----------------------------------|
| react            | UI framework                     |
| react-dom        | DOM rendering                    |
| react-router-dom | Client-side routing              |
| axios            | HTTP client with interceptors    |
| recharts         | Dashboard charts (Bar, Pie)      |
| vite             | Build tool + dev server          |
