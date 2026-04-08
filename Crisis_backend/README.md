# CrisisConnect — Backend API

Node.js + Express + MongoDB backend for the CrisisConnect disaster management platform.

---

## 📁 Project Structure

```
crisisconnect-backend/
├── server.js                  # Entry point
├── package.json
├── .env.example
│
├── config/
│   └── db.js                  # MongoDB connection
│
├── models/
│   ├── User.js                # Users (admin / coordinator / volunteer)
│   ├── HelpRequest.js         # Disaster help requests
│   └── Assignment.js          # Volunteer ↔ Request assignments
│
├── controllers/
│   ├── auth.controller.js     # Register, login, profile
│   ├── user.controller.js     # User CRUD (admin)
│   ├── request.controller.js  # Help request CRUD
│   ├── volunteer.controller.js# Volunteer management
│   ├── assignment.controller.js # Assignment logic
│   └── dashboard.controller.js  # Stats & monitoring
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── request.routes.js
│   ├── volunteer.routes.js
│   ├── assignment.routes.js
│   └── dashboard.routes.js
│
├── middleware/
│   ├── auth.middleware.js     # JWT protect + role authorise
│   └── validate.middleware.js # express-validator error handler
│
└── utils/
    ├── generateToken.js       # JWT generator
    ├── apiResponse.js         # Standard response helpers
    └── seeder.js              # Demo data seeder
```

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. (Optional) Seed demo data
node utils/seeder.js

# 4. Start development server
npm run dev

# Start production server
npm start
```

---

## 🔐 Roles & Permissions

| Role        | Capabilities                                                             |
|-------------|--------------------------------------------------------------------------|
| admin       | Full access — manage users, requests, assignments, dashboard             |
| coordinator | View users, manage requests, assign volunteers, view dashboard           |
| volunteer   | Create/view own requests, view & update own assignments, toggle availability |

---

## 📡 API Endpoints

### Auth  `/api/auth`
| Method | Endpoint            | Access  | Description           |
|--------|---------------------|---------|-----------------------|
| POST   | /register           | Public  | Register new user     |
| POST   | /login              | Public  | Login & get JWT       |
| GET    | /me                 | Private | Get own profile       |
| PUT    | /change-password    | Private | Update password       |

### Users  `/api/users`
| Method | Endpoint              | Access           | Description           |
|--------|-----------------------|------------------|-----------------------|
| GET    | /                     | Admin/Coordinator| Get all users         |
| GET    | /:id                  | Admin/Coordinator| Get user by ID        |
| PUT    | /:id                  | Self/Admin       | Update user           |
| PATCH  | /:id/toggle-status    | Admin            | Activate/deactivate   |
| DELETE | /:id                  | Admin            | Delete user           |

### Help Requests  `/api/requests`
| Method | Endpoint        | Access   | Description               |
|--------|-----------------|----------|---------------------------|
| GET    | /               | Private  | List all (role-filtered)  |
| GET    | /:id            | Private  | Get single request        |
| POST   | /               | Private  | Create new request        |
| PUT    | /:id            | Private  | Update request            |
| POST   | /:id/notes      | Private  | Add note to request       |
| DELETE | /:id            | Private  | Delete request            |

### Volunteers  `/api/volunteers`
| Method | Endpoint              | Access           | Description              |
|--------|-----------------------|------------------|--------------------------|
| GET    | /                     | Admin/Coordinator| List all volunteers      |
| GET    | /:id                  | Self/Admin/Coord | Get volunteer profile    |
| PATCH  | /:id/availability     | Self/Admin       | Toggle availability      |

### Assignments  `/api/assignments`
| Method | Endpoint        | Access           | Description               |
|--------|-----------------|------------------|---------------------------|
| GET    | /               | Admin/Coordinator| List all assignments      |
| GET    | /my             | Volunteer        | My assignments            |
| POST   | /               | Admin/Coordinator| Assign volunteer          |
| PATCH  | /:id/status     | Volunteer/Admin  | Update assignment status  |
| DELETE | /:id            | Admin            | Cancel assignment         |

### Dashboard  `/api/dashboard`
| Method | Endpoint   | Access           | Description        |
|--------|------------|------------------|--------------------|
| GET    | /stats     | Admin/Coordinator| Summary stats      |
| GET    | /activity  | Admin/Coordinator| Recent activity    |

---

## 🔑 Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Logging**: morgan
