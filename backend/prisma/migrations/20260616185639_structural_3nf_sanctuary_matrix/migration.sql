/*
  Warnings:

  - You are about to alter the column `email` on the `visitors` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `password_hash` on the `visitors` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `first_name` on the `visitors` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `last_name` on the `visitors` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('RANGER', 'VETERINARIAN', 'ADMINISTRATOR', 'FIELD_ANALYST');

-- AlterTable
ALTER TABLE "visitors" ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "first_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "last_name" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "enclosures" (
    "enclosure_id" SERIAL NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "code_name" TEXT NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "current_occupancy" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "enclosures_pkey" PRIMARY KEY ("enclosure_id")
);

-- CreateTable
CREATE TABLE "animals" (
    "animal_id" SERIAL NOT NULL,
    "enclosure_id" INTEGER,
    "species" VARCHAR(100) NOT NULL,
    "scientific_name" VARCHAR(150),
    "nickname" VARCHAR(100),
    "birth_date" DATE,
    "date_joined" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "health_status" "AnimalStatus" NOT NULL DEFAULT 'HEALTHY',

    CONSTRAINT "animals_pkey" PRIMARY KEY ("animal_id")
);

-- CreateTable
CREATE TABLE "animal_surveys" (
    "survey_id" BIGSERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "survey_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sighting_count" INTEGER NOT NULL DEFAULT 1,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,

    CONSTRAINT "animal_surveys_pkey" PRIMARY KEY ("survey_id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "feedback_id" SERIAL NOT NULL,
    "visitor_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'RANGER',
    "license_no" VARCHAR(100),
    "joined_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "health_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "veterinarian_id" INTEGER NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "require_isolation" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enclosures_code_name_key" ON "enclosures"("code_name");

-- CreateIndex
CREATE INDEX "animals_health_status_idx" ON "animals"("health_status");

-- CreateIndex
CREATE INDEX "animal_surveys_animal_id_survey_date_idx" ON "animal_surveys"("animal_id", "survey_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_license_no_key" ON "staff"("license_no");

-- CreateIndex
CREATE INDEX "health_logs_animal_id_logged_at_idx" ON "health_logs"("animal_id", "logged_at" DESC);

-- AddForeignKey
ALTER TABLE "enclosures" ADD CONSTRAINT "enclosures_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("zone_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_enclosure_id_fkey" FOREIGN KEY ("enclosure_id") REFERENCES "enclosures"("enclosure_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_surveys" ADD CONSTRAINT "animal_surveys_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("animal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("visitor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("animal_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "staff"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;
