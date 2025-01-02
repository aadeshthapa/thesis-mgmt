import express from "express";
import {
  authenticateToken,
  authorizeRoles,
  AuthRequest,
} from "../middleware/auth";
import { userService } from "../../services/userService";

const router = express.Router();

// Protect all student routes
router.use(authenticateToken);
router.use(authorizeRoles("STUDENT"));

// Update student profile
router.put("/profile", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const {
      firstName,
      lastName,
      studentId,
      department,
      program,
      enrollmentYear,
    } = req.body;

    // Update base user info
    await userService.updateUser(userId, {
      firstName,
      lastName,
    });

    // Update student profile
    await userService.updateStudentProfile(userId, {
      studentId,
      department,
      program,
      enrollmentYear: parseInt(enrollmentYear),
    });

    // Get updated user data with profile
    const updatedUser = await userService.getUserWithProfile(userId);
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Failed to update profile",
    });
  }
});

export default router;
