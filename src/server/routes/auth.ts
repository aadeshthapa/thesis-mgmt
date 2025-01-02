import express, { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;
import { validateEmail, validatePassword } from "../utils/validation.js";

interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const router: Router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.post(
  "/register",
  async (req: TypedRequestBody<RegisterBody>, res: Response) => {
    const { name, email, password, phone, role } = req.body;

    try {
      // Validate input
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers",
        });
      }

      // Check if user already exists
      const userExists = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, phone, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, role`,
        [name, email, hashedPassword, phone, role]
      );

      return res.status(201).json({
        message: "Registration successful",
        user: result.rows[0],
      });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
