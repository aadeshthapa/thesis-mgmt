import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { courseService } from "../../services/courseService";

const router = express.Router();

// Get all courses (accessible by all authenticated users)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
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
    const courses = await courseService.getStudentCourses(userId);
    res.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Failed to fetch enrolled courses" });
  }
});

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

// Enroll a student in a course (supervisor and admin only)
router.post(
  "/enroll",
  authenticateToken,
  authorizeRoles("SUPERVISOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { studentId, courseId } = req.body;
      const enrollment = await courseService.enrollStudent(studentId, courseId);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  }
);

// Unenroll a student from a course (supervisor and admin only)
router.delete(
  "/enroll",
  authenticateToken,
  authorizeRoles("SUPERVISOR", "ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const { studentId, courseId } = req.body;
      await courseService.unenrollStudent(studentId, courseId);
      res.json({ message: "Student unenrolled successfully" });
    } catch (error) {
      console.error("Error unenrolling student:", error);
      res.status(500).json({ message: "Failed to unenroll student" });
    }
  }
);

export default router;
