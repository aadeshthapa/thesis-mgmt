import type { User, UserRole } from "@prisma/client";
import { userService } from "./userService";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
if (!process.env.JWT_SECRET) {
  console.warn(
    "Warning: JWT_SECRET not set in environment variables. Using default secret key."
  );
}

type BaseRegistrationData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type StudentRegistrationData = BaseRegistrationData & {
  role: Extract<UserRole, "STUDENT">;
  studentId: string;
  department: string;
  program: string;
  enrollmentYear: number;
};

type SupervisorRegistrationData = BaseRegistrationData & {
  role: Extract<UserRole, "SUPERVISOR">;
  department: string;
  specialization: string;
};

type AdminRegistrationData = BaseRegistrationData & {
  role: Extract<UserRole, "ADMIN">;
  department: string;
  position: string;
};

export type RegistrationData =
  | StudentRegistrationData
  | SupervisorRegistrationData
  | AdminRegistrationData;

export type AuthResponse = {
  user: User;
  token: string;
};

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

class AuthService {
  async register(data: RegistrationData): Promise<User> {
    try {
      // Create base user
      const { email, password, firstName, lastName, role, ...profileData } =
        data;
      const user = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      // Create role-specific profile
      switch (role) {
        case "STUDENT":
          await userService.createStudentProfile(
            user.id,
            profileData as {
              studentId: string;
              department: string;
              program: string;
              enrollmentYear: number;
            }
          );
          break;

        case "SUPERVISOR":
          await userService.createSupervisorProfile(
            user.id,
            profileData as {
              department: string;
              specialization: string;
            }
          );
          break;

        case "ADMIN":
          // For admin users, we don't create a separate profile
          break;
      }

      // Get complete user data with profile
      const userWithProfile = await userService.getUserWithProfile(user.id);
      if (!userWithProfile) {
        throw new AuthError("Failed to create user profile");
      }

      return userWithProfile;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Registration failed");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user exists
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new AuthError("Invalid email or password");
      }

      // Verify password
      const isValid = await userService.verifyPassword(email, password);
      if (!isValid) {
        throw new AuthError("Invalid email or password");
      }

      // Get user with profile
      const userWithProfile = await userService.getUserWithProfileByEmail(
        email
      );
      if (!userWithProfile) {
        throw new AuthError("Failed to load user profile");
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: userWithProfile.id, role: userWithProfile.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return { user: userWithProfile, token };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Login failed");
    }
  }
}

export const authService = new AuthService();
