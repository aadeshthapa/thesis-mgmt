import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SupervisorInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface CourseWithDetails {
  id: string;
  code: string;
  name: string;
  category: string;
  supervisors: SupervisorInfo[];
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SupervisorWithDetails {
  supervisor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

class CourseService {
  async getAllCourses(): Promise<CourseWithDetails[]> {
    try {
      console.log("Fetching all courses with enrollments...");
      const courses = await (prisma as any).course.findMany({
        include: {
          supervisors: {
            include: {
              supervisor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      console.log("Raw courses data:", JSON.stringify(courses, null, 2));

      if (!Array.isArray(courses)) {
        console.error("Courses is not an array:", courses);
        return [];
      }

      if (courses.length === 0) {
        console.log("No courses found");
        return [];
      }

      console.log(
        "First course structure:",
        JSON.stringify(courses[0], null, 2)
      );

      const transformedCourses = courses.map((course) => {
        if (!course) {
          console.error("Course is undefined");
          return null;
        }

        console.log("Processing course ID:", course.id);
        console.log(
          "Course supervisors raw:",
          JSON.stringify(course.supervisors, null, 2)
        );

        const supervisors = course.supervisors
          .filter((s: any) => s && s.supervisor)
          .map((s: any) => ({
            id: s.supervisor.id,
            firstName: s.supervisor.firstName,
            lastName: s.supervisor.lastName,
          }));

        console.log(
          "Processed supervisors:",
          JSON.stringify(supervisors, null, 2)
        );

        const result = {
          id: course.id,
          code: course.code,
          name: course.name,
          category: course.category,
          supervisors,
          enrolledCount: course._count?.enrollments || 0,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };

        console.log("Transformed course:", JSON.stringify(result, null, 2));
        return result;
      });

      const validCourses = transformedCourses.filter(
        Boolean
      ) as CourseWithDetails[];
      console.log("Final courses count:", validCourses.length);
      return validCourses;
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      throw error;
    }
  }

  async createCourse(data: { code: string; name: string; category: string }) {
    try {
      return await (prisma as any).course.create({
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
      await (prisma as any).enrollment.deleteMany({
        where: {
          courseId,
        },
      });

      // Then delete all supervisor assignments
      await (prisma as any).supervisorCourse.deleteMany({
        where: {
          courseId,
        },
      });

      // Finally delete the course
      return await (prisma as any).course.delete({
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
      return await (prisma as any).enrollment.create({
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
      return await (prisma as any).enrollment.delete({
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
      const enrollments = await (prisma as any).enrollment.findMany({
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

      return enrollments.map((enrollment: any) => ({
        id: enrollment.user.id,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        studentId: enrollment.user.studentProfile?.studentId,
      }));
    } catch (error) {
      console.error("Error in getCourseStudents:", error);
      throw error;
    }
  }

  async getStudentCourses(userId: string) {
    try {
      const enrollments = await (prisma as any).enrollment.findMany({
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

      return enrollments.map((enrollment: any) => ({
        id: enrollment.course.id,
        code: enrollment.course.code,
        name: enrollment.course.name,
        category: enrollment.course.category,
        enrolledCount: enrollment.course._count.enrollments,
      }));
    } catch (error) {
      console.error("Error in getStudentCourses:", error);
      throw error;
    }
  }

  async assignSupervisor(courseId: string, supervisorId: string) {
    try {
      // First check if the supervisor is already assigned
      const existingSupervisor = await (
        prisma as any
      ).supervisorCourse.findUnique({
        where: {
          supervisorId_courseId: {
            supervisorId,
            courseId,
          },
        },
        include: {
          supervisor: true,
        },
      });

      if (existingSupervisor) {
        throw new Error(
          `${existingSupervisor.supervisor.firstName} ${existingSupervisor.supervisor.lastName} is already assigned to this course`
        );
      }

      return await (prisma as any).supervisorCourse.create({
        data: {
          supervisorId,
          courseId,
        },
      });
    } catch (error) {
      console.error("Error in assignSupervisor:", error);
      throw error;
    }
  }

  async removeSupervisor(courseId: string, supervisorId: string) {
    try {
      return await (prisma as any).supervisorCourse.delete({
        where: {
          supervisorId_courseId: {
            supervisorId,
            courseId,
          },
        },
      });
    } catch (error) {
      console.error("Error in removeSupervisor:", error);
      throw error;
    }
  }

  async getCourse(courseId: string): Promise<CourseWithDetails> {
    try {
      const course = await (prisma as any).course.findUnique({
        where: { id: courseId },
        include: {
          supervisors: {
            include: {
              supervisor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      const supervisors = course.supervisors
        .filter((s: any) => s && s.supervisor)
        .map((s: any) => ({
          id: s.supervisor.id,
          firstName: s.supervisor.firstName,
          lastName: s.supervisor.lastName,
        }));

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        category: course.category,
        supervisors,
        enrolledCount: course._count?.enrollments || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    } catch (error) {
      console.error("Error in getCourse:", error);
      throw error;
    }
  }
}

export const courseService = new CourseService();
