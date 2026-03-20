-- AlterTable: add phone column with default for existing rows
ALTER TABLE "listings" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';
