-- CreateEnum
CREATE TYPE "WineType" AS ENUM ('tinto', 'branco', 'rose', 'espumante', 'fortificado', 'outro');

-- CreateEnum
CREATE TYPE "SuggestionCategory" AS ENUM ('carne', 'peixe', 'massa', 'queijo', 'sobremesa', 'vegetariano', 'ocasiao', 'outro');

-- CreateEnum
CREATE TYPE "SuggestionIntensity" AS ENUM ('leve', 'media', 'intensa');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "producer" TEXT NOT NULL,
    "type" "WineType" NOT NULL,
    "grape" TEXT,
    "country" TEXT,
    "region" TEXT,
    "vintage" INTEGER,
    "alcoholPct" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "purchasePrice" DOUBLE PRECISION,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastronomicSuggestion" (
    "id" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SuggestionCategory" NOT NULL,
    "description" TEXT,
    "intensity" "SuggestionIntensity",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastronomicSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Wine_userId_name_idx" ON "Wine"("userId", "name");

-- CreateIndex
CREATE INDEX "Wine_userId_type_idx" ON "Wine"("userId", "type");

-- CreateIndex
CREATE INDEX "GastronomicSuggestion_wineId_idx" ON "GastronomicSuggestion"("wineId");

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastronomicSuggestion" ADD CONSTRAINT "GastronomicSuggestion_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
