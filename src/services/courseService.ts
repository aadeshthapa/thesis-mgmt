import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
}

export const courseService = {
  async getEnrolledCourses(userId: string): Promise<Course[]> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: true,
        },
      });

      return enrollments.map((enrollment) => ({
        id: enrollment.course.id,
        code: enrollment.course.code,
        name: enrollment.course.name,
        category: enrollment.course.category,
      }));
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw error;
    }
  },

  async getAllCourses() {
    return prisma.course.findMany();
  },

  async getStudentCourses(userId: string) {
    console.log("Getting courses for student:", userId);
    const courses = await prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
    });
    console.log("Found courses in service:", courses);
    return courses;
  },

  async createCourse(data: { code: string; name: string; category: string }) {
    return prisma.course.create({
      data,
    });
  },

  async enrollStudent(userId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  },

  async unenrollStudent(userId: string, courseId: string) {
    return prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  },
};
