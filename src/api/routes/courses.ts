import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { courseService } from "../../services/backend/courseService";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/assignments";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PDF and Word documents are allowed.")
      );
    }
  },
});

// Get all courses (accessible by all authenticated users)
router.get("/", authenticateToken, async (_req: AuthRequest, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Get student's enrolled courses
router.get("/enrolled", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    console.log("Fetching courses for user:", userId);
    const courses = await courseService.getStudentCourses(userId);
    console.log("Found courses:", courses);
    res.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Failed to fetch enrolled courses" });
  }
});

// Get supervisor's courses
router.get(
  "/supervisor/courses",
  authenticateToken,
  authorizeRoles("SUPERVISOR"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const courses = await courseService.getSupervisorCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching supervisor courses:", error);
      res.status(500).json({ message: "Failed to fetch supervisor courses" });
    }
  }
);

// Create a new course (admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { code, name, category } = req.body;
      const course = await courseService.createCourse({
        code,
        name,
        category,
      });
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  }
);

// Get course students
router.get(
  "/:courseId/students",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const students = await courseService.getCourseStudents(courseId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching course students:", error);
      res.status(500).json({ message: "Failed to fetch course students" });
    }
  }
);

// Enroll a student in a course
router.post(
  "/:courseId/students",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const { studentId } = req.body;
      await courseService.enrollStudent(courseId, studentId);
      res.status(201).json({ message: "Student enrolled successfully" });
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  }
);

// Remove a student from a course
router.delete(
  "/:courseId/students/:studentId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId, studentId } = req.params;
      await courseService.unenrollStudent(courseId, studentId);
      res.json({ message: "Student removed successfully" });
    } catch (error) {
      console.error("Error removing student:", error);
      res.status(500).json({ message: "Failed to remove student" });
    }
  }
);

// Delete a course (admin only)
router.delete(
  "/:courseId",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      await courseService.deleteCourse(courseId);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  }
);

// Add supervisor to course (admin only)
router.post(
  "/:courseId/supervisors",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const { supervisorId } = req.body;
      await courseService.assignSupervisor(courseId, supervisorId);
      res.status(201).json({ message: "Supervisor assigned successfully" });
    } catch (error) {
      console.error("Error assigning supervisor:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to assign supervisor" });
      }
    }
  }
);

// Remove supervisor from course (admin only)
router.delete(
  "/:courseId/supervisors/:supervisorId",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId, supervisorId } = req.params;
      await courseService.removeSupervisor(courseId, supervisorId);
      res.json({ message: "Supervisor removed successfully" });
    } catch (error) {
      console.error("Error removing supervisor:", error);
      res.status(500).json({ message: "Failed to remove supervisor" });
    }
  }
);

// Get a single course
router.get("/:courseId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourse(courseId);
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

// Get assignments for a course (student view)
router.get(
  "/:courseId/assignments",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;

      // Verify student is enrolled in the course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "Not enrolled in this course",
        });
      }

      // Get all assignments for the course with student's submissions
      const assignments = await prisma.assignment.findMany({
        where: {
          courseId,
        },
        select: {
          id: true,
          title: true,
          submissions: {
            where: {
              studentId: userId,
            },
            select: {
              status: true,
              grade: true,
              feedback: true,
              submissionDate: true,
              fileUrl: true,
            },
          },
        },
      });

      // Format the response
      const formattedAssignments = assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        status: assignment.submissions[0]?.status || "PENDING",
        grade: assignment.submissions[0]?.grade,
        feedback: assignment.submissions[0]?.feedback,
        submissionDate: assignment.submissions[0]?.submissionDate,
        fileUrl: assignment.submissions[0]?.fileUrl,
      }));

      res.json(formattedAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  }
);

// Get assignments with submissions for a course (supervisor only)
router.get(
  "/:courseId/assignments/submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;

      // Verify user is a supervisor for this course
      const supervisorCourse = await prisma.supervisorCourse.findUnique({
        where: {
          supervisorId_courseId: {
            supervisorId: userId,
            courseId,
          },
        },
      });

      if (!supervisorCourse) {
        return res.status(403).json({
          message: "Not authorized to view this course's assignments",
        });
      }

      // Get assignments with submissions
      const assignments = await prisma.assignment.findMany({
        where: {
          courseId,
        },
        include: {
          submissions: {
            include: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments with submissions:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  }
);

// Create an assignment for a course (supervisor only)
router.post(
  "/:courseId/assignments",
  authenticateToken,
  authorizeRoles("SUPERVISOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const { title, instructions } = req.body;
      const userId = req.user!.userId;

      console.log("Creating assignment:", {
        userId,
        courseId,
        title,
        instructions,
        userRole: req.user?.role,
      });

      // If user is admin, skip supervisor check
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      console.log("Found user:", user);

      if (user?.role !== "ADMIN") {
        // Verify user is a supervisor for this course
        const supervisorCourse = await prisma.supervisorCourse.findUnique({
          where: {
            supervisorId_courseId: {
              supervisorId: userId,
              courseId,
            },
          },
        });

        console.log("Found supervisorCourse:", supervisorCourse);

        if (!supervisorCourse) {
          console.log(
            "Permission denied: User is not a supervisor for this course"
          );
          return res.status(403).json({
            message: "Not authorized to create assignments for this course",
          });
        }
      }

      // Create the assignment
      const assignment = await prisma.assignment.create({
        data: {
          title,
          instructions,
          courseId,
        },
      });

      console.log("Created assignment:", assignment);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create assignment" });
      }
    }
  }
);

// Delete an assignment from a course (supervisor only)
router.delete(
  "/:courseId/assignments/:assignmentId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId, assignmentId } = req.params;
      const userId = req.user!.userId;

      // Verify user is a supervisor for this course
      const supervisorCourse = await prisma.supervisorCourse.findUnique({
        where: {
          supervisorId_courseId: {
            supervisorId: userId,
            courseId,
          },
        },
      });

      if (!supervisorCourse && req.user!.role !== "ADMIN") {
        return res.status(403).json({
          message: "Not authorized to delete assignments in this course",
        });
      }

      // Get the assignment to verify it exists and belongs to this course
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          courseId: courseId,
        },
      });

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Delete the assignment (this will cascade delete submissions)
      await prisma.assignment.delete({
        where: { id: assignmentId },
      });

      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  }
);

// Submit an assignment
router.post(
  "/:courseId/assignments/:assignmentId/submit",
  authenticateToken,
  upload.single("file"),
  async (req: AuthRequest & { file?: Express.Multer.File }, res) => {
    try {
      const { courseId, assignmentId } = req.params;
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Verify student is enrolled in the course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      // Verify assignment exists and belongs to the course
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          courseId,
        },
      });

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Create or update submission
      const submission = await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: userId,
          },
        },
        update: {
          fileUrl: file.path,
          status: "SUBMITTED",
          submissionDate: new Date(),
        },
        create: {
          assignmentId,
          studentId: userId,
          fileUrl: file.path,
          status: "SUBMITTED",
        },
      });

      res.json(submission);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  }
);

// Get a single assignment
router.get(
  "/:courseId/assignments/:assignmentId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId, assignmentId } = req.params;
      const userId = req.user!.userId;

      // Check if user is a supervisor for this course
      const supervisorCourse = await prisma.supervisorCourse.findUnique({
        where: {
          supervisorId_courseId: {
            supervisorId: userId,
            courseId,
          },
        },
      });

      // If not a supervisor, verify student enrollment
      if (!supervisorCourse && req.user!.role !== "ADMIN") {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        });

        if (!enrollment) {
          return res.status(403).json({
            message: "Not enrolled in this course",
          });
        }
      }

      // Get the assignment with course details
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          courseId: courseId,
        },
        include: {
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.json(assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  }
);

// Update assignment instructions
router.patch(
  "/:courseId/assignments/:assignmentId",
  authenticateToken,
  authorizeRoles("SUPERVISOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId, assignmentId } = req.params;
      const { instructions } = req.body;
      const userId = req.user!.userId;

      // Verify user is a supervisor for this course
      const supervisorCourse = await prisma.supervisorCourse.findUnique({
        where: {
          supervisorId_courseId: {
            supervisorId: userId,
            courseId,
          },
        },
      });

      if (!supervisorCourse && req.user!.role !== "ADMIN") {
        return res.status(403).json({
          message: "Not authorized to update assignments in this course",
        });
      }

      // Verify the assignment exists and belongs to this course
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          courseId,
        },
      });

      if (!existingAssignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Update the assignment
      const assignment = await prisma.assignment.update({
        where: {
          id: assignmentId,
        },
        data: {
          instructions: instructions || null, // Convert empty string to null
        },
      });

      res.json(assignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Failed to update assignment" });
    }
  }
);

export default router;
