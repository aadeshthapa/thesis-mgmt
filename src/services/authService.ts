import type { UserRole } from "@prisma/client";
import { userService } from "./userService";
import jwt from "jsonwebtoken";

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
  permissions: string[];
};

export type RegistrationData =
  | StudentRegistrationData
  | SupervisorRegistrationData
  | AdminRegistrationData;

class AuthService {
  async register(data: RegistrationData) {
    // Create base user
    const { email, password, firstName, lastName, role, ...profileData } = data;
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
        await userService.createAdminProfile(
          user.id,
          profileData as {
            department: string;
            position: string;
            permissions: string[];
          }
        );
        break;
    }

    // Get complete user data with profile
    const userWithProfile = await userService.getUserWithProfile(user.id);
    return userWithProfile;
  }

  async login(email: string, password: string) {
    // Check if user exists
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = await userService.verifyPassword(email, password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Get user with profile
    const userWithProfile = await userService.getUserWithProfileByEmail(email);
    if (!userWithProfile) {
      throw new Error("Failed to load user profile");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userWithProfile.id, role: userWithProfile.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return { user: userWithProfile, token };
  }
}

export const authService = new AuthService();
