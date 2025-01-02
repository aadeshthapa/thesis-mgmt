-- CreateTable
CREATE TABLE "SupervisorCourse" (
    "id" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupervisorCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupervisorCourse_supervisorId_idx" ON "SupervisorCourse"("supervisorId");

-- CreateIndex
CREATE INDEX "SupervisorCourse_courseId_idx" ON "SupervisorCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorCourse_supervisorId_courseId_key" ON "SupervisorCourse"("supervisorId", "courseId");

-- AddForeignKey
ALTER TABLE "SupervisorCourse" ADD CONSTRAINT "SupervisorCourse_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorCourse" ADD CONSTRAINT "SupervisorCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
