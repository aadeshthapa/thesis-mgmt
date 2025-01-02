import express from "express";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", async (req, res) => {
  try {
    const registrationData = req.body;

    // Add default permissions for admin
    if (registrationData.role === "ADMIN") {
      registrationData.permissions = ["VIEW_REPORTS"];
    }

    const user = await authService.register(registrationData);
    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const user = await authService.login(email, password);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    console.log("Login successful for user:", email);
    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      message: "Invalid email or password",
    });
  }
});

router.post("/logout", (req, res) => {
  // Since we're using JWT, we just send a success response
  // The client will remove the token
  res.json({ message: "Logout successful" });
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate the new password
    if (
      !newPassword ||
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers",
      });
    }

    const success = await userService.resetPassword(email, newPassword);

    if (success) {
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(400).json({ message: "Failed to update password" });
    }
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to reset password",
    });
  }
});

export default router;
