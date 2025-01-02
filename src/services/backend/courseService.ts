import { PrismaClient } from "@prisma/client";
import type {
  Course,
  User,
  Enrollment,
  SupervisorCourse,
} from "@prisma/client";

const prisma = new PrismaClient();

interface CourseWithRelations extends Course {
  supervisors: (SupervisorCourse & {
    supervisor: User;
  })[];
  _count: {
    enrollments: number;
  };
}

interface EnrollmentWithUser extends Enrollment {
  user: User & {
    studentProfile: {
      studentId: string;
    } | null;
  };
}

interface EnrollmentWithCourse extends Enrollment {
  course: Course & {
    _count: {
      enrollments: number;
    };
  };
}

class CourseService {
  async getAllCourses() {
    try {
      console.log("Fetching all courses with enrollments...");
      const courses = await prisma.course.findMany({
        include: {
          supervisors: {
            include: {
              supervisor: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
          enrollments: true,
        },
      });

      console.log("Raw courses data:", JSON.stringify(courses, null, 2));

      return (courses as CourseWithRelations[]).map((course) => {
        console.log(
          `Course ${course.code} has ${course._count.enrollments} enrollments`
        );
        return {
          id: course.id,
          code: course.code,
          name: course.name,
          category: course.category,
          supervisors: course.supervisors.map(
            (s: SupervisorCourse & { supervisor: User }) => ({
              id: s.supervisor.id,
              firstName: s.supervisor.firstName,
              lastName: s.supervisor.lastName,
            })
          ),
          enrolledCount: course._count.enrollments,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      });
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      throw error;
    }
  }

  async createCourse(data: { code: string; name: string; category: string }) {
    try {
      return await prisma.course.create({
        data,
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error in createCourse:", error);
      throw error;
    }
  }

  async deleteCourse(courseId: string) {
    try {
      // First delete all enrollments
      await prisma.enrollment.deleteMany({
        where: {
          courseId,
        },
      });

      // Then delete all supervisor assignments
      await prisma.supervisorCourse.deleteMany({
        where: {
          courseId,
        },
      });

      // Finally delete the course
      return await prisma.course.delete({
        where: {
          id: courseId,
        },
      });
    } catch (error) {
      console.error("Error in deleteCourse:", error);
      throw error;
    }
  }

  async enrollStudent(courseId: string, studentId: string) {
    try {
      return await prisma.enrollment.create({
        data: {
          userId: studentId,
          courseId,
        },
      });
    } catch (error) {
      console.error("Error in enrollStudent:", error);
      throw error;
    }
  }

  async unenrollStudent(courseId: string, studentId: string) {
    try {
      return await prisma.enrollment.delete({
        where: {
          userId_courseId: {
            userId: studentId,
            courseId,
          },
        },
      });
    } catch (error) {
      console.error("Error in unenrollStudent:", error);
      throw error;
    }
  }

  async getCourseStudents(courseId: string) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
        },
        include: {
          user: {
            include: {
              studentProfile: true,
            },
          },
        },
      });

      return (enrollments as EnrollmentWithUser[]).map((enrollment) => ({
        id: enrollment.user.id,
        studentId: enrollment.user.studentProfile?.studentId || "",
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
      }));
    } catch (error) {
      console.error("Error in getCourseStudents:", error);
      throw error;
    }
  }

  async getStudentCourses(userId: string) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
        },
        include: {
          course: {
            include: {
              _count: {
                select: {
                  enrollments: true,
                },
              },
            },
          },
        },
      });

      return (enrollments as EnrollmentWithCourse[]).map((enrollment) => ({
        ...enrollment.course,
        enrolledCount: enrollment.course._count.enrollments,
      }));
    } catch (error) {
      console.error("Error in getStudentCourses:", error);
      throw error;
    }
  }
}

export const courseService = new CourseService();
