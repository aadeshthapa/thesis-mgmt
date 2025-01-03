import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { courseService } from "../../services/backend/courseService";

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

export default router;
