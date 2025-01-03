import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// Get all students
router.get("/students", async (req, res) => {
  console.log("GET /api/admin/students endpoint hit");
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
      },
    });
    console.log(`Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get all supervisors
router.get("/supervisors", async (req, res) => {
  console.log("GET /api/admin/supervisors endpoint hit");
  try {
    const supervisors = await prisma.user.findMany({
      where: {
        role: "SUPERVISOR",
      },
      include: {
        supervisorProfile: true,
      },
    });
    console.log(`Found ${supervisors.length} supervisors`);
    res.json(supervisors);
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    res.status(500).json({ error: "Failed to fetch supervisors" });
  }
});

export default router;
