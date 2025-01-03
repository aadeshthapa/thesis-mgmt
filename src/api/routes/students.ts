import express from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Search students (accessible by authenticated users)
router.get("/search", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    if (typeof q !== "string" || q.length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    const students = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          {
            studentProfile: { studentId: { contains: q, mode: "insensitive" } },
          },
        ],
        role: "STUDENT",
        studentProfile: {
          isNot: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentProfile: {
          select: {
            studentId: true,
          },
        },
      },
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentProfile?.studentId || "",
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ message: "Failed to search students" });
  }
});

export default router;
