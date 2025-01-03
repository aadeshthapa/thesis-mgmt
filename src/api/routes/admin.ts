import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { supervisorService } from "../../services/supervisorService";
import { User, StudentProfile } from "@prisma/client";

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

interface UserWithStudentProfile extends User {
  studentProfile: StudentProfile | null;
}

// Search students endpoint
router.get("/students/search", async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const students = (await supervisorService.getStudents(
      query
    )) as UserWithStudentProfile[];

    // Format the response to match the Student interface expected by the frontend
    const formattedStudents = students
      .map((student) => {
        const studentId = student.studentProfile?.studentId;
        // Only include students who have a studentId
        if (!studentId) {
          return null;
        }
        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: studentId,
        };
      })
      .filter(
        (student): student is NonNullable<typeof student> => student !== null
      );

    res.json(formattedStudents);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ message: "Failed to search students" });
  }
});

export default router;
