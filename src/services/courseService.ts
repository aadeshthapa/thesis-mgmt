import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const courseService = {
  async getEnrolledCourses(userId: string): Promise<Course[]> {
    try {
      const enrollments = await (prisma as any).enrollment.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: true,
        },
      });

      return enrollments.map((enrollment: any) => ({
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

  async getAllCourses(): Promise<Course[]> {
    return (prisma as any).course.findMany();
  },

  async getStudentCourses(userId: string): Promise<Course[]> {
    console.log("Getting courses for student:", userId);
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: true,
      },
    });

    const courses = enrollments.map((enrollment: any) => ({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
      category: enrollment.course.category,
      createdAt: enrollment.course.createdAt,
      updatedAt: enrollment.course.updatedAt,
    }));

    console.log("Found courses in service:", courses);
    return courses;
  },

  async createCourse(data: {
    code: string;
    name: string;
    category: string;
  }): Promise<Course> {
    return (prisma as any).course.create({
      data,
    });
  },

  async enrollStudent(userId: string, courseId: string) {
    return (prisma as any).enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  },

  async unenrollStudent(userId: string, courseId: string) {
    return (prisma as any).enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  },
};
