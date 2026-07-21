-- ============================================================
-- Migration: sync_visitors_role_and_staff_schema
-- Brings the database in line with the current schema.prisma.
--
-- Changes vs previous migrations:
--   1. Create Role enum (VISITOR, RANGER, ADMIN)
--   2. Add "role" column to visitors table
--   3. Rebuild staff table to match the current schema
--      (was: auto-increment PK + name + license_no + joined_at)
--      (now: visitor_id FK as PK + first_name + last_name + role VARCHAR)
--   4. Restore health_logs FK with ON DELETE CASCADE (was RESTRICT)
-- ============================================================

-- 1. Create the Role enum
CREATE TYPE "Role" AS ENUM ('VISITOR', 'STAFF', 'ADMIN');

-- 2. Add role column to visitors (defaults every existing row to VISITOR)
ALTER TABLE "visitors" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'VISITOR';

-- 3. Rebuild staff table -------------------------------------------

-- Drop the FK from health_logs first (references old staff.staff_id)
ALTER TABLE "health_logs" DROP CONSTRAINT "health_logs_veterinarian_id_fkey";

-- Drop the old staff table (also drops its indexes automatically)
DROP TABLE "staff";

-- Create staff with the new structure (staff_id is a FK to visitors)
CREATE TABLE "staff" (
    "staff_id"   INTEGER      NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name"  VARCHAR(100) NOT NULL,
    "role"       VARCHAR(50)  NOT NULL,
    "email"      VARCHAR(150) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- Unique index on email
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- FK: staff.staff_id → visitors.visitor_id (CASCADE delete, NO ACTION update)
ALTER TABLE "staff" ADD CONSTRAINT "staff_staff_id_fkey"
    FOREIGN KEY ("staff_id")
    REFERENCES "visitors"("visitor_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

-- 4. Restore health_logs FK pointing to the new staff table
--    (now CASCADE on delete so removing a vet also removes their logs)
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_veterinarian_id_fkey"
    FOREIGN KEY ("veterinarian_id")
    REFERENCES "staff"("staff_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
