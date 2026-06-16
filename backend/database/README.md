# 🗄️ Core Database Extensions

This directory contains advanced procedural database objects that extend our baseline Prisma structural definitions. These extensions leverage native **PL/pgSQL** scripts to build real-time transaction guardrails, pricing computation triggers, and analytics compilation layouts entirely on the database engine disk space.

---

## 🗺️ Relational Architecture Extensions

| Object Name | Type | Target Layer | Functional Purpose |
| :--- | :--- | :--- | :--- |
| `fn_calculate_ticket_costs` | Trigger Function | `tickets` Table | Automatically fetches active zone pricing and appends an 18% GST calculation before completing the record insertion. |
| `fn_enforce_enclosure_capacity` | Trigger Function | `animals` Table | Performs an atomic check on the target environment limits. Rejects data insertion and rolls back the execution frame if max capacity constraints are breached. |
| `sp_book_safari_ticket` | Stored Procedure | Transactions | Provides an ACID-compliant transactional pipeline for handling safari ticket generation with full execution error rollbacks. |
| `v_zone_popularity_analytics` | Relational View | Dashboards | Performs dynamic analytical aggregations and relational LEFT JOINs to compile revenue metrics per sector. |
| `v_visitor_age_demographics` | Relational View | Dashboards | Segregates registered visitor data pools into standardized statistical age brackets for demographic profiling feeds. |

---

## 🚀 How to Initialize Extensions Globally

Because these extensions build on top of our physical 3NF relations, you must execute the scripts following our infrastructure startup pipeline:

### 1. Step 1: Run Baseline Prisma Migrations
Ensure your local PostgreSQL schema layout matches our configuration specifications by initializing our database state through your terminal command line:
```bash
npx prisma migrate dev