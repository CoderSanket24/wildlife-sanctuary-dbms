-- ============================================================
-- Migration: fix_role_enum_ranger_to_staff
--
-- Migration 3 incorrectly created the Role enum with 'RANGER'
-- instead of 'STAFF'. This migration renames it to match schema.prisma.
--
-- Uses a conditional so it is safe on fresh installs (where migration 3
-- was already corrected and 'RANGER' never existed).
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Role' AND e.enumlabel = 'RANGER'
  ) THEN
    ALTER TYPE "Role" RENAME VALUE 'RANGER' TO 'STAFF';
  END IF;
END $$;
