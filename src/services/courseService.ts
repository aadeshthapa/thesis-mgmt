import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface CoursesByCategory {
  [category: string]: Course[];
}

export const courseService = {
  async getEnrolledCourses(userId: string) {
    try {
      const enrollments = await prisma.$queryRaw`
        SELECT c.* 
        FROM "Course" c
        JOIN "Enrollment" e ON e."courseId" = c.id
        WHERE e."userId" = ${userId}
      `;

      // Group courses by category
      const coursesByCategory = (enrollments as Course[]).reduce(
        (acc: CoursesByCategory, course: Course) => {
          if (!acc[course.category]) {
            acc[course.category] = [];
          }
          acc[course.category].push(course);
          return acc;
        },
        {}
      );

      return coursesByCategory;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw error;
    }
  },

  async getAllCourses() {
    return prisma.course.findMany();
  },

  async getStudentCourses(userId: string) {
    return prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
    });
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
