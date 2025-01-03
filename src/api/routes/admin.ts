import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { supervisorService } from "../../services/supervisorService";

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// Search students endpoint
router.get("/students/search", async (req: AuthRequest, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const students = await supervisorService.getStudents(query);
    res.json(students);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ message: "Failed to search students" });
  }
});

export default router;
