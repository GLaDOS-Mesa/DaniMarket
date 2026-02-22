-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('CLOTHING', 'SHOES', 'ACCESSORIES', 'ELECTRONICS', 'HOME', 'SPORTS', 'BOOKS_MEDIA', 'GAMES', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'GOOD', 'FAIR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "PackageSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('EBAY', 'VINTED', 'SUBITO', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "PlatformPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ERROR', 'REMOVED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'PUBLISHED', 'UPDATED', 'REMOVED', 'SOLD', 'DRAFTED', 'DELETED', 'PLATFORM_ADDED', 'PLATFORM_REMOVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "condition" "ListingCondition" NOT NULL,
    "brand" TEXT,
    "size" TEXT,
    "colors" TEXT[],
    "material" TEXT,
    "city" TEXT NOT NULL,
    "province" VARCHAR(2) NOT NULL,
    "shipping_available" BOOLEAN NOT NULL DEFAULT true,
    "package_size" "PackageSize",
    "shipping_cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_publications" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "PlatformPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "platform_listing_id" TEXT,
    "platform_listing_url" TEXT,
    "published_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "platform" "Platform",
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "platform_publications_listing_id_platform_key" ON "platform_publications"("listing_id", "platform");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_publications" ADD CONSTRAINT "platform_publications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
