/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Thesis` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Thesis` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Course_code_idx";

-- DropIndex
DROP INDEX "Enrollment_courseId_idx";

-- DropIndex
DROP INDEX "Enrollment_userId_idx";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "instructions" TEXT;

-- AlterTable
ALTER TABLE "Thesis" DROP COLUMN "fileUrl",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "ThesisRevision" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "document" TEXT NOT NULL,
    "comments" TEXT,
    "thesisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThesisRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThesisFeedback" (
    "id" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "thesisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThesisFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThesisRevision_thesisId_idx" ON "ThesisRevision"("thesisId");

-- CreateIndex
CREATE INDEX "ThesisFeedback_thesisId_idx" ON "ThesisFeedback"("thesisId");

-- AddForeignKey
ALTER TABLE "ThesisRevision" ADD CONSTRAINT "ThesisRevision_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesisFeedback" ADD CONSTRAINT "ThesisFeedback_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
