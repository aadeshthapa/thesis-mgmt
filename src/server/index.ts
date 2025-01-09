import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "../api/routes/auth";
import studentRouter from "../api/routes/student";
import courseRoutes from "../api/routes/courses";
import adminRouter from "../api/routes/admin";
import studentsRouter from "../api/routes/students";
import assignmentsRouter from "../api/routes/assignments";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/student", studentRouter);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/students", studentsRouter);
app.use("/api/assignments", assignmentsRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
