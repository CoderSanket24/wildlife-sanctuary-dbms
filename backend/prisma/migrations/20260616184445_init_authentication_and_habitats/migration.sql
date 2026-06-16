-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('HEALTHY', 'UNDER_CARE', 'CRITICAL', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "ClimateType" AS ENUM ('TROPICAL', 'TEMPERATE', 'ARID', 'WETLAND', 'ALPINE');

-- CreateTable
CREATE TABLE "visitors" (
    "visitor_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("visitor_id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "ticket_id" BIGSERIAL NOT NULL,
    "visitor_id" INTEGER NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base_cost" DECIMAL(10,2) NOT NULL,
    "gst_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "zones" (
    "zone_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "climate" "ClimateType" NOT NULL DEFAULT 'TROPICAL',
    "camera_traps_count" INTEGER NOT NULL DEFAULT 0,
    "ticket_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("zone_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_email_key" ON "visitors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("visitor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;
