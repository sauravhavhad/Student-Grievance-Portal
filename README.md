# Student Grievance & Facility Maintenance Portal

A full-stack MERN application that lets students report facility and campus
issues (electrical, plumbing, Wi‑Fi, hostel, security, etc.), track them
through a clear status timeline, and give feedback once resolved — while
admins triage, assign, and resolve grievances from a dedicated dashboard.

> Built as a beginner-friendly, well-structured project suitable for a
> college Software Testing practical (functionality only — no test suite is
> included; testing is intended to be done separately).

---

## 1. Features

### Student
- Register / login / logout
- View and edit-free profile page
- Submit a grievance (title, category, description, location, priority, optional image URL)
- View "My Grievances" with search, status filter, and category filter
- View full grievance details with a visual status timeline and status history
- Submit feedback (1–5 rating + comment) once a grievance is Resolved

### Admin
- Login / logout
- Dashboard with real-time stats (total, pending, in progress, resolved, rejected, high priority) plus recent/high‑priority/recently‑resolved lists
- View all grievances with search (ID, title, student name), filters (status, category, priority), and sorting (newest, oldest, priority)
- Assign a grievance to a staff member
- Change grievance status with an enforced valid transition flow, each change logged to status history
- Delete invalid/spam grievances
- Manage a simple staff directory (add/remove staff)
- Admin profile page

### Cross-cutting
- JWT authentication + bcrypt password hashing
- Role-based route protection on both frontend and backend (a student can never reach admin APIs/pages)
- Centralized backend error handling with consistent JSON responses and correct HTTP status codes
- Frontend loading states and friendly error messages everywhere data is fetched
- Fully responsive UI (desktop, laptop, tablet, mobile)

---

## 2. Technology Stack

**Frontend:** React.js (Vite), JavaScript, HTML5, CSS3, React Router, Axios
**Backend:** Node.js, Express.js, JavaScript
**Database:** MongoDB, Mongoose
**Auth:** JWT, bcryptjs

---

## 3. Project Architecture

The app is a classic two-tier MERN app: a React SPA (client) talks to an
Express REST API (server) over HTTP/JSON, and the API talks to MongoDB via
Mongoose. Auth is stateless JWT — the token is stored in `localStorage` on
the client and sent as a `Bearer` token on every request.

```
Browser (React SPA)  --axios-->  Express REST API  --mongoose-->  MongoDB
```

---

## 4. Folder Structure

```text
student-grievance-portal/
│
├── client/                      # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── components/          # Navbar, Sidebar, badges, PrivateRoute, etc.
│       ├── pages/                # Route-level pages (student + admin)
│       ├── services/             # axios instance (api.js)
│       ├── context/              # AuthContext (login/register/logout state)
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/                      # Express backend
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # auth, student, grievance, admin controllers
│   ├── middleware/                # auth (JWT), role (authorize), errorHandler
│   ├── models/                    # User, Grievance, Staff (Mongoose schemas)
│   ├── routes/                    # authRoutes, studentRoutes, grievanceRoutes, adminRoutes
│   ├── utils/                     # apiResponse, generateToken, seedAdmin
│   ├── app.js                     # Express app + route mounting
│   ├── server.js                  # Entry point (connects DB, starts server)
│   └── .env.example
│
├── README.md
├── .gitignore
└── package.json                  # convenience scripts for both halves
```

---

## 5. Requirements

- Node.js 18+ and npm
- A MongoDB database — either:
  - a local MongoDB instance (`mongodb://127.0.0.1:27017/grievance_portal`), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended for beginners)

---

## 6. Installation

Clone/download the project, then install dependencies for each half.

```bash
cd server
npm install
```

```bash
cd client
npm install
```

(Optional) From the project root you can also run `npm run install:all` if
you keep the root `package.json` — it just wraps the two commands above.

---

## 7. MongoDB Setup

**Option A — MongoDB Atlas (no local install needed)**
1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user and allow your IP (or `0.0.0.0/0` for local dev)
3. Copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/grievance_portal`

**Option B — Local MongoDB**
1. Install MongoDB Community Server and start it
2. Use `mongodb://127.0.0.1:27017/grievance_portal` as your connection string

---

## 8. Environment Variables

Copy the example file and fill in real values:

```bash
cd server
cp .env.example .env
```

`server/.env`:

```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Only used by utils/seedAdmin.js for local development
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
SEED_ADMIN_DEPARTMENT=Administration
```

Never commit `.env` — it's already covered by `.gitignore`.

The client reads an optional `VITE_API_URL` (defaults to
`http://localhost:5000/api`). If you need to override it, create
`client/.env`:

```text
VITE_API_URL=http://localhost:5000/api
```

---

## 9. How to Run the Backend

```bash
cd server
npm install
npm run dev
```

The API starts on `http://localhost:5000` (or your `PORT`). You should see
`MongoDB connected: ...` and `Server running on port 5000` in the console.

## 10. How to Run the Frontend

In a **second terminal**:

```bash
cd client
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

---

## 11. API Endpoint List

**Auth**
```
POST   /api/auth/register        Register a new student
POST   /api/auth/login           Login (student or admin)
POST   /api/auth/logout          Logout (protected)
GET    /api/auth/me              Get current authenticated user
```

**Student**
```
GET    /api/students/profile     Get logged-in student's profile
```

**Grievances**
```
POST   /api/grievances                 Create a grievance (student)
GET    /api/grievances/my              Student's own grievances (search/status/category)
GET    /api/grievances/:id             Grievance details (owner student, admin, or staff)
POST   /api/grievances/:id/feedback    Submit feedback (student, only after Resolved)
PATCH  /api/grievances/:id/status      Update status (admin only)
PATCH  /api/grievances/:id/assign      Assign staff (admin only)
```

**Admin**
```
GET    /api/admin/dashboard            Dashboard stats + recent/high-priority/resolved lists
GET    /api/admin/grievances           All grievances (search/status/category/priority/sort)
DELETE /api/admin/grievances/:id       Delete a grievance
GET    /api/admin/staff                List staff
POST   /api/admin/staff                Add a staff member
DELETE /api/admin/staff/:id            Remove a staff member
GET    /api/admin/profile              Admin profile
```

All responses follow:

```json
{ "success": true,  "message": "...", "data": {} }
{ "success": false, "message": "..." }
```

---

## 12. Student Workflow

```
Register → Login → Dashboard → Submit Grievance → Grievance Created
  → View My Grievances → View Details → Track Status
  → (Admin updates status) → Status becomes Resolved → Give Feedback
```

## 13. Admin Workflow

```
Admin Login → Admin Dashboard → View All Grievances → Search/Filter
  → Open Grievance → Assign Staff → Change Status → Resolve/Reject
  → View Updated Information
```

---

## 14. Default Development Admin Setup

Admin accounts are **not** created through a public registration endpoint.
Instead, use the seed script after setting the `SEED_ADMIN_*` values in
`server/.env`:

```bash
cd server
npm run seed:admin
```

This creates one admin account (default: `admin@example.com` /
`Admin@123`, or whatever you set in `.env`). These are **development
credentials only** — change the password immediately in any shared or
production environment.

---

## 15. Future Improvements

- Email/SMS notifications on status changes
- File upload for grievance images instead of an external image URL
- Pagination for large grievance lists
- Staff-facing accounts and dashboard (currently staff are just assignable records)
- Analytics charts (category/priority trends over time)
- Password reset flow

---

## 16. Notes

This build focuses purely on functionality. Testing (unit, integration,
black-box, white-box, Postman collections, etc.) is intentionally **not**
included here and is meant to be added separately.
