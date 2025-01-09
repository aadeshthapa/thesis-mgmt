/*
  Warnings:

  - You are about to drop the column `description` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the `ThesisFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThesisRevision` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileUrl` to the `Thesis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Thesis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ThesisFeedback" DROP CONSTRAINT "ThesisFeedback_thesisId_fkey";

-- DropForeignKey
ALTER TABLE "ThesisRevision" DROP CONSTRAINT "ThesisRevision_thesisId_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "description",
DROP COLUMN "dueDate";

-- AlterTable
ALTER TABLE "Thesis" ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ThesisFeedback";

-- DropTable
DROP TABLE "ThesisRevision";

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");
