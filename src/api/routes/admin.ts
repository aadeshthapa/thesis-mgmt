import express from "express";
import {
  PrismaClient,
  User,
  StudentProfile,
  SupervisorProfile,
} from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import bcrypt from "bcrypt";
import { supervisorService } from "../../services/supervisorService";

const router = express.Router();
const prisma = new PrismaClient();

interface UserWithStudentProfile extends User {
  studentProfile: StudentProfile | null;
}

interface UserWithSupervisorProfile extends User {
  supervisorProfile: SupervisorProfile | null;
}

// Log all requests to admin routes
router.use((req, res, next) => {
  console.log(`Admin route hit: ${req.method} ${req.path}`);
  console.log("Request body:", req.body);
  next();
});

// Protect all admin routes
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// Search students endpoint
router.get("/students/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log("Searching students with query:", query);
    const students = await supervisorService.getStudents(query);
    console.log(`Found ${students.length} matching students`);

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

// Search supervisors endpoint
router.get("/supervisors/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log("Searching supervisors with query:", query);
    const supervisors = (await prisma.user.findMany({
      where: {
        role: "SUPERVISOR",
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        supervisorProfile: true,
      },
    })) as UserWithSupervisorProfile[];

    console.log(`Found ${supervisors.length} matching supervisors`);

    // Format the response to match the Supervisor interface expected by the frontend
    const formattedSupervisors = supervisors
      .map((supervisor) => {
        if (!supervisor.supervisorProfile) {
          return null;
        }
        return {
          id: supervisor.id,
          firstName: supervisor.firstName,
          lastName: supervisor.lastName,
          department: supervisor.supervisorProfile.department,
        };
      })
      .filter(
        (supervisor): supervisor is NonNullable<typeof supervisor> =>
          supervisor !== null
      );

    res.json(formattedSupervisors);
  } catch (error) {
    console.error("Error searching supervisors:", error);
    res.status(500).json({ message: "Failed to search supervisors" });
  }
});

// Create new user
router.post("/users", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    role,
    department,
    specialization,
    studentId,
  } = req.body;

  console.log("Received create user request:", {
    firstName,
    lastName,
    email,
    role,
    department,
    specialization,
    studentId,
  });

  try {
    // Generate a random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user with role:", role);

    // Create user with transaction to ensure profile is created
    const user = await prisma.$transaction(async (prisma) => {
      // Create the user
      console.log("Creating base user...");
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          role,
        },
      });
      console.log("Base user created:", newUser.id);

      // Create profile based on role
      if (role === "STUDENT") {
        console.log("Creating student profile...");
        await prisma.studentProfile.create({
          data: {
            userId: newUser.id,
            studentId: studentId!,
            department: department || "Not Specified",
            program: "Thesis Program", // Default program
            enrollmentYear: new Date().getFullYear(), // Current year as enrollment year
          },
        });
        console.log("Student profile created");
      } else if (role === "SUPERVISOR") {
        console.log("Creating supervisor profile...");
        await prisma.supervisorProfile.create({
          data: {
            userId: newUser.id,
            department: department!,
            specialization: specialization!,
          },
        });
        console.log("Supervisor profile created");
      }

      return newUser;
    });

    console.log("User creation successful");

    // Return the created user without the password
    const { passwordHash, ...userWithoutPassword } = user;
    res.status(201).json({
      ...userWithoutPassword,
      temporaryPassword: password, // Include the temporary password in the response
    });
  } catch (error: any) {
    console.error("Error creating user:", {
      error: error.message,
      stack: error.stack,
      details: error,
    });
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
      details: error.code || "Unknown error code",
    });
  }
});

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

// Assign supervisor to course
router.post("/courses/:courseId/supervisors", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { supervisorId } = req.body;

    if (!courseId || !supervisorId) {
      return res
        .status(400)
        .json({ message: "Course ID and Supervisor ID are required" });
    }

    await supervisorService.assignCourseToSupervisor(supervisorId, courseId);
    res.status(201).json({ message: "Supervisor assigned successfully" });
  } catch (error) {
    console.error("Error assigning supervisor:", error);
    res.status(500).json({ message: "Failed to assign supervisor" });
  }
});

// Remove supervisor from course
router.delete(
  "/courses/:courseId/supervisors/:supervisorId",
  async (req, res) => {
    try {
      const { courseId, supervisorId } = req.params;
      await supervisorService.removeCourseFromSupervisor(
        supervisorId,
        courseId
      );
      res.json({ message: "Supervisor removed successfully" });
    } catch (error) {
      console.error("Error removing supervisor:", error);
      res.status(500).json({ message: "Failed to remove supervisor" });
    }
  }
);

// Export the router
export default router;
