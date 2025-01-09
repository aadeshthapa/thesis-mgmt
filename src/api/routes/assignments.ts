import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticateToken,
  AuthRequest,
  authorizeRoles,
} from "../middleware/auth";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uploadDir = "uploads/assignments";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
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

// Create assignments for a course (admin only)
router.post(
  "/:courseId",
  authenticateToken,
  authorizeRoles("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const { title } = req.body;

      const assignment = await prisma.assignment.create({
        data: {
          title,
          courseId,
        },
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  }
);

// Get assignments for a course (student view)
router.get(
  "/course/:courseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;

      // Get all assignments for the course
      const assignments = await prisma.assignment.findMany({
        where: {
          courseId: courseId,
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

interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

// Submit an assignment
router.post(
  "/:assignmentId/submit",
  authenticateToken,
  upload.single("file"),
  async (req: AuthRequestWithFile, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the assignment to verify it exists and get the courseId
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { course: true },
      });

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Verify student is enrolled in the course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: assignment.courseId,
          },
        },
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
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

// Get a specific submission
router.get(
  "/:assignmentId/submission",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user!.userId;

      const submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: userId,
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  }
);

// Get assignments for review (supervisor only)
router.get("/reviews", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Verify user is a supervisor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { supervisorProfile: true },
    });

    if (!user || !user.supervisorProfile) {
      return res
        .status(403)
        .json({ message: "Access denied. Supervisor only." });
    }

    // Get courses where user is supervisor
    const supervisorCourses = await prisma.supervisorCourse.findMany({
      where: { supervisorId: userId },
      select: { courseId: true },
    });

    const courseIds = supervisorCourses.map((sc) => sc.courseId);

    // Get pending reviews
    const pending = await prisma.assignmentSubmission.findMany({
      where: {
        status: "SUBMITTED",
        assignment: {
          courseId: {
            in: courseIds,
          },
        },
      },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get completed reviews
    const completed = await prisma.assignmentSubmission.findMany({
      where: {
        status: "GRADED",
        assignment: {
          courseId: {
            in: courseIds,
          },
        },
      },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({ pending, completed });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Grade a submission
router.post(
  "/submissions/:submissionId/grade",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      const userId = req.user!.userId;

      // Verify the submission exists
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: {
            include: {
              course: {
                include: {
                  supervisors: {
                    where: {
                      supervisorId: userId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Verify user is a supervisor for this course
      if (submission.assignment.course.supervisors.length === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized to grade this submission" });
      }

      // Update the submission
      const updatedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade,
          feedback,
          status: "GRADED",
        },
      });

      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  }
);

export default router;
