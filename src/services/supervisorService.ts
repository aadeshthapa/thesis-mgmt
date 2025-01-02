import { PrismaClient, User, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface SupervisorCourse {
  id: string;
  supervisorId: string;
  courseId: string;
  course: {
    id: string;
    code: string;
    name: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface SupervisorWithCourses extends User {
  supervisorProfile: {
    id: string;
    department: string;
    specialization: string;
  } | null;
  supervisorCourses: SupervisorCourse[];
}

class SupervisorService {
  async getSupervisors(searchQuery?: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: "SUPERVISOR",
        OR: searchQuery
          ? [
              { firstName: { contains: searchQuery, mode: "insensitive" } },
              { lastName: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        supervisorProfile: true,
      },
    });
  }

  async getStudents(searchQuery?: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: searchQuery
          ? [
              { firstName: { contains: searchQuery, mode: "insensitive" } },
              { lastName: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        studentProfile: true,
      },
    });
  }

  async getSupervisorCourses(
    supervisorId: string
  ): Promise<SupervisorCourse[]> {
    const supervisorCourses = await prisma.supervisorCourse.findMany({
      where: {
        supervisorId,
      },
      include: {
        course: true,
      },
    });

    return supervisorCourses;
  }

  async assignCourseToSupervisor(
    supervisorId: string,
    courseId: string
  ): Promise<void> {
    await prisma.supervisorCourse.create({
      data: {
        supervisorId,
        courseId,
      },
    });
  }

  async removeCourseFromSupervisor(
    supervisorId: string,
    courseId: string
  ): Promise<void> {
    await prisma.supervisorCourse.delete({
      where: {
        supervisorId_courseId: {
          supervisorId,
          courseId,
        },
      },
    });
  }

  async assignCourseToStudent(
    studentId: string,
    courseId: string
  ): Promise<void> {
    await prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId,
      },
    });
  }

  async removeCourseFromStudent(
    studentId: string,
    courseId: string
  ): Promise<void> {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });
  }

  async getStudentCourses(
    studentId: string
  ): Promise<SupervisorCourse["course"][]> {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: studentId,
      },
      include: {
        course: true,
      },
    });

    return enrollments.map((enrollment) => enrollment.course);
  }
}

export const supervisorService = new SupervisorService();
