# 🌿 Wildlife Sanctuary DBMS

A full-stack **Database Management System** for managing a wildlife sanctuary — tracking animals, zones, enclosures, staff, health records, visitor tickets, surveys, and admin controls.

Built with a **React + Vite** frontend, an **Express.js + PostgreSQL** (via Prisma ORM) backend, and custom PL/pgSQL database triggers & views.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema & Triggers](#database-schema--triggers)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Pages & Navigation](#pages--navigation)
- [Docker (Local Development)](#-docker-local-development)
- [Deployment Architecture (Render + Vercel)](#️-deployment-architecture-render--vercel)

---

## ✨ Features

- 🔐 **Authentication & RBAC** — Visitor registration & login with JWT (HTTP-only cookies), Argon2 password hashing, and role-based access control (`VISITOR`, `STAFF`, `ADMIN`).
- 🗺️ **Zone Management** — Browse and manage sanctuary zones with climate types, capacity indicators, and ticket pricing.
- 🐘 **Animal & Enclosure Tracking** — View animals by species, scientific classification, health status, enclosure, and survey sightings.
- 🏥 **Veterinary Health Logs** — Veterinarians log diagnoses, treatments, and isolation flags for animals under care.
- 📍 **Field Surveying** — Geospatial sighting logs (`latitude`, `longitude`, sighting counts) recorded by field rangers.
- 🎟️ **Automated Ticket Billing** — Visitors book zone entry tickets with automated base cost and 18% GST calculation via database triggers.
- ⚡ **Automated Role Sync** — Triggers keep `visitors.role` and `staff` records in sync dynamically.
- 📊 **Interactive Admin Dashboard** — Real-time analytics, zone summaries, health alerts, user management, and contact message management.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| React Router v7 | Client-side routing (with Vercel SPA rewrite rules) |
| Tailwind CSS v4 | Styling |
| Axios | HTTP client (configured with credentials) |
| React Hook Form | Form state management & validation |
| Lucide React | Modern icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| PostgreSQL 16 | Relational database |
| Prisma ORM 7 | Database schema & query layer |
| Argon2 | Password hashing |
| JSON Web Tokens | Authentication |
| Zod | Schema validation |
| express-rate-limit | Rate limiting & brute-force protection |
| Helmet | HTTP security headers |

---

## 📁 Project Structure

```
wildlife-sanctuary-dbms/
├── backend/
│   ├── config/             # DB connection config (Prisma client)
│   ├── controllers/        # Route handler logic
│   ├── database/           # Core PL/pgSQL extensions & triggers
│   │   └── core_extension.sql
│   ├── middlewares/        # Auth & Zod validation middleware
│   ├── prisma/
│   │   ├── schema.prisma   # Database models & enums
│   │   └── migrations/     # Prisma migration history
│   ├── routes/             # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── faunaRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── habitatRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── zoneRoutes.js
│   ├── utils/              # Utility helpers (patchBigInt)
│   ├── start.sh            # Production startup script (migrations + extensions)
│   ├── Dockerfile          # Multi-stage Docker build
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── public/             # Static assets (video carousel)
│   ├── vercel.json         # SPA rewrite configuration
│   └── src/
│       ├── api/            # Axios API client
│       ├── components/     # Reusable UI components & modals
│       ├── constants/      # App constants
│       ├── context/        # React Context (AuthContext)
│       ├── pages/          # Application routes & Admin tabs
│       ├── App.jsx         # Root router configuration
│       └── main.jsx        # Entry point
└── render.yaml             # Render Blueprint configuration
```

---

## 🗄️ Database Schema & Triggers

### 📐 Entity Relationship Diagram (ERD)

```mermaid
classDiagram
    direction TB

    class VISITOR {
        +int visitor_id PK
        +string email
        +string first_name
        +string last_name
        +int age
        +Role role
        +datetime created_at
    }

    class STAFF {
        +int staff_id PK
        +string first_name
        +string last_name
        +StaffRole role
        +string email
    }

    class ZONE {
        +int zone_id PK
        +string name
        +ClimateType climate
        +int camera_traps_count
        +decimal ticket_price
    }

    class ENCLOSURE {
        +int enclosure_id PK
        +int zone_id FK
        +string code_name
        +int max_capacity
        +int current_occupancy
    }

    class ANIMAL {
        +int animal_id PK
        +int enclosure_id FK
        +string species
        +string scientific_name
        +string nickname
        +date birth_date
        +AnimalStatus health_status
    }

    class TICKET {
        +bigint ticket_id PK
        +int visitor_id FK
        +int zone_id FK
        +datetime booking_date
        +decimal base_cost
        +decimal gst_amount
        +decimal total_amount
    }

    class HEALTH_LOG {
        +bigint log_id PK
        +int animal_id FK
        +int veterinarian_id FK
        +datetime logged_at
        +string diagnosis
        +string treatment
        +boolean require_isolation
    }

    class SURVEY {
        +bigint survey_id PK
        +int animal_id FK
        +datetime survey_date
        +int sighting_count
        +decimal latitude
        +decimal longitude
    }

    VISITOR "1" -- "0..1" STAFF : promoted_to
    VISITOR "1" -- "*" TICKET : books
    ZONE "1" -- "*" ENCLOSURE : contains
    ZONE "1" -- "*" TICKET : issued_for
    ENCLOSURE "1" -- "*" ANIMAL : houses
    ANIMAL "1" -- "*" HEALTH_LOG : medical_history
    STAFF "1" -- "*" HEALTH_LOG : attends
    ANIMAL "1" -- "*" SURVEY : sightings
```

---

### Core Models

| Model | Description |
|---|---|
| `Zone` | Sanctuary zones with climate type and ticket pricing |
| `Enclosure` | Habitats within zones with occupancy capacity tracking |
| `Animal` | Animals with species, health status, and enclosure relationships |
| `Survey` | Field sighting records with GPS coordinates (`latitude`, `longitude`) |
| `Visitor` | Registered accounts with role-based access control (`VISITOR`, `STAFF`, `ADMIN`) |
| `Ticket` | Zone entry bookings with GST cost breakdown |
| `Staff` | Staff members mapped to visitors (`RANGER`, `VETERINARIAN`, `ADMINISTRATOR`, `FIELD_ANALYST`) |
| `HealthLog` | Medical records logged by veterinarians |
| `Feedback` | Visitor ratings and comments |
| `ContactMessage` | Public contact submissions |

### Database Triggers & Views (`core_extension.sql`)

The project uses advanced PostgreSQL features defined in [`backend/database/core_extension.sql`](backend/database/core_extension.sql):

| Object | Type | Purpose |
|---|---|---|
| `fn_calculate_ticket_costs` | Trigger | Auto-computes `base_cost`, 18% GST, and `total_amount` on ticket insert |
| `fn_enforce_enclosure_capacity` | Trigger | Prevents animal insert if enclosure is full; auto-increments `current_occupancy` |
| `fn_sync_staff_on_role_change` | Trigger | Auto-creates/updates `staff` row (`ADMIN` → `ADMINISTRATOR`, `STAFF` → `RANGER`) or deletes if demoted to `VISITOR` |
| `fn_book_safari_ticket` | Function | Validates visitor & zone in a single database transaction |
| `vw_zone_summary` | View | Zone enclosure count, occupancy %, and revenue summary |
| `vw_animal_health_overview` | View | Animal health overview with log & survey counts |
| `vw_health_alerts` | View | Alerts for animals marked `CRITICAL` or `UNDER_CARE` with attending vet notes |
| `vw_visitor_booking_summary` | View | Per-visitor booking history and total spend |

---

## 🌐 API Routes

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new visitor
- `POST /api/auth/login` — Sign in (sets HTTP-only cookie)
- `POST /api/auth/logout` — Sign out & clear cookie
- `GET  /api/auth/me` — Fetch current user session

### Tickets (`/api/tickets`)
- `GET  /api/tickets/my` — Fetch current visitor's booking history
- `POST /api/tickets/book` — Book a safari zone ticket

### Admin Control Panel (`/api/admin` — Requires `ADMIN` role)
- `GET  /api/admin/stats` — Overall sanctuary statistics & analytics
- `GET  /api/admin/visitors` & `PUT /api/admin/visitors/:id/role` — Manage users & promote roles
- `GET  /api/admin/staff` & `POST /api/admin/staff` — Manage staff records
- `GET  /api/admin/enclosures` — Enclosure occupancy management
- `GET  /api/admin/health-logs` & `GET /api/admin/surveys` — View medical logs and field surveys
- `GET  /api/admin/contact` — Manage contact submissions

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

3. **Configure environment variables:** Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wildlife_db?schema=public"
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Apply core SQL extensions (Triggers & Views):**
   ```bash
   node scripts/applyExtensions.js
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
   The application will be available at `http://localhost:5173`.

---

## 🐳 Docker (Local Development)

The repository includes a complete local Docker environment (`docker-compose.yml`).

```bash
# Start backend API + PostgreSQL together
docker compose up --build

# In a separate terminal, start the frontend
cd frontend && npm run dev
```

---

## ☁️ Deployment Architecture (Render + Vercel)

This application is deployed across modern cloud services for maximum performance and stability:

- **Backend API & PostgreSQL**: Hosted on **Render** using Docker and Managed PostgreSQL.
  - On every deployment, `start.sh` automatically runs `npx prisma migrate deploy` and executes `node scripts/applyExtensions.js` to ensure all triggers and views are live.
- **Frontend SPA**: Hosted on **Vercel** with `vercel.json` rewrite rules configured for seamless React Router client-side navigation.

---

## 📄 License

This project is licensed under the **MIT License**.
