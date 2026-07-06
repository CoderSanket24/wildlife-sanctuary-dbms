# 🌿 Wildlife Sanctuary DBMS

A full-stack **Database Management System** for managing a wildlife sanctuary — tracking animals, zones, enclosures, staff, health records, visitor tickets, and more.

Built with a **React + Vite** frontend and an **Express.js + PostgreSQL** (via Prisma ORM) backend.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Pages & Navigation](#pages--navigation)

---

## ✨ Features

- 🔐 **Authentication** — Visitor registration & login with JWT (HTTP-only cookies) and Argon2 password hashing
- 🗺️ **Zone Management** — Browse and manage sanctuary zones with climate types and camera trap counts
- 🐘 **Animal Tracking** — View animals by species, health status, enclosure, and survey sightings
- 🏥 **Health Logs** — Veterinarians log diagnoses, treatments, and isolation flags for animals
- 🎟️ **Ticket Booking** — Visitors can book zone entry tickets with GST calculation
- 📊 **Dashboard** — Role-based dashboard with stats for admins, rangers, and visitors
- 👤 **Profile Management** — View and manage visitor/staff profile details
- 💬 **Feedback System** — Visitors can submit ratings and comments

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | HTTP client |
| React Hook Form | Form state management |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database schema & query layer |
| Argon2 | Password hashing |
| JSON Web Tokens | Authentication |
| Zod | Request validation |
| Cookie Parser | HTTP-only cookie support |
| dotenv | Environment configuration |

---

## 📁 Project Structure

```
wildlife-sanctuary-dbms/
├── backend/
│   ├── config/             # DB connection config
│   ├── controllers/        # Route handler logic
│   ├── database/           # Database helpers
│   ├── middlewares/        # Auth & validation middleware
│   ├── prisma/
│   │   ├── schema.prisma   # Database models
│   │   └── migrations/     # Migration history
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── faunaRoutes.js
│   │   ├── habitatRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── zoneRoutes.js
│   ├── utils/              # Utility helpers
│   ├── server.js           # Express app entry point
│   └── .env                # Environment variables (not committed)
│
└── frontend/
    ├── public/             # Static assets
    └── src/
        ├── api/            # Axios API calls
        ├── components/     # Reusable UI components
        ├── constants/      # App-wide constants
        ├── context/        # React context providers
        ├── hooks/          # Custom React hooks
        ├── pages/          # Route-level page components
        │   ├── Home.jsx
        │   ├── AboutUs.jsx
        │   ├── Services.jsx
        │   ├── Contact.jsx
        │   ├── SignIn.jsx
        │   ├── SignUp.jsx
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── Zones.jsx
        │   ├── ZoneDetail.jsx
        │   ├── Animals.jsx
        │   ├── AnimalDetail.jsx
        │   └── Tickets.jsx
        ├── App.jsx         # Root router
        └── main.jsx        # React entry point
```

---

## 🗄️ Database Schema

The database uses **PostgreSQL** with the following models managed by Prisma:

| Model | Description |
|---|---|
| `Zone` | Sanctuary zones with climate type and ticket pricing |
| `Enclosure` | Habitats within zones with capacity tracking |
| `Animal` | Animals with species, health status, and survey data |
| `Survey` | GPS sighting records for animals |
| `Visitor` | Registered users (visitors and staff) |
| `Ticket` | Zone entry bookings with GST cost breakdown |
| `Feedback` | Visitor ratings and comments |
| `Staff` | Staff members (rangers, vets, admins) |
| `HealthLog` | Medical records logged by veterinarians |

### Enums

- **`AnimalStatus`** — `HEALTHY`, `UNDER_CARE`, `CRITICAL`, `QUARANTINED`
- **`ClimateType`** — `TROPICAL`, `TEMPERATE`, `ARID`, `WETLAND`, `ALPINE`
- **`Role`** — `VISITOR`, `RANGER`, `ADMIN`
- **`StaffRole`** — `RANGER`, `VETERINARIAN`, `ADMINISTRATOR`, `FIELD_ANALYST`

---

## 🌐 API Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new visitor |
| `POST` | `/api/auth/signin` | Log in and receive JWT cookie |
| `POST` | `/api/auth/signout` | Clear auth cookie |
| `GET` | `/api/zones` | List all sanctuary zones |
| `GET` | `/api/zones/:id` | Get zone details |
| `GET` | `/api/sanctuary` | List all enclosures/habitats |
| `GET` | `/api/fauna` | List all animals |
| `GET` | `/api/fauna/:id` | Get individual animal details |
| `GET` | `/api/medical` | List health logs |
| `POST` | `/api/medical` | Create a health log entry |
| `GET` | `/api/ticket` | Get tickets for the current visitor |
| `POST` | `/api/ticket` | Book a new zone ticket |
| `GET` | `/api/dashboard` | Get dashboard summary stats |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- npm

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables)):
   ```bash
   # Create a .env file in the backend/ directory and fill in your values
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server port
PORT=5000

# PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/wildlife_db?schema=public"

# JWT secret key
JWT_SECRET=your_super_secret_jwt_key

# Frontend origin (for CORS)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🗺️ Pages & Navigation

### Public Routes
| Path | Page |
|---|---|
| `/` | Home |
| `/about` | About Us |
| `/services` | Services |
| `/contact` | Contact |
| `/signin` | Sign In |
| `/signup` | Sign Up |

### Protected Routes (require login)
| Path | Page |
|---|---|
| `/dashboard` | Main dashboard with stats |
| `/dashboard/profile` | User profile |
| `/dashboard/zones` | All sanctuary zones |
| `/dashboard/zones/:id` | Zone detail & enclosures |
| `/dashboard/animals` | Animal directory |
| `/dashboard/animals/:id` | Animal detail & health log |
| `/dashboard/tickets` | Ticket booking & history |

---

## 📄 License

This project is licensed under the **MIT License**.
