import {
  PrismaClient,
  User,
  UserRole,
  StudentProfile,
  SupervisorProfile,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, "role">>;

type UserWithProfiles = User & {
  studentProfile: StudentProfile | null;
  supervisorProfile: SupervisorProfile | null;
};

export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    const { password, ...rest } = data;
    console.log("Creating user with password:", {
      email: rest.email,
      password,
      passwordLength: password.length,
    });

    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Generated password hash:", {
      email: rest.email,
      hashLength: passwordHash.length,
      hash: passwordHash,
    });

    return prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    const updateData: Partial<CreateUserInput & { passwordHash: string }> = {
      ...data,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log("User not found during password verification:", email);
      return false;
    }

    try {
      console.log("Password verification details:", {
        email,
        inputPassword: password,
        inputPasswordLength: password.length,
        storedHashLength: user.passwordHash.length,
        storedHash: user.passwordHash,
      });

      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log("Password verification result:", {
        email,
        isValid,
        inputPasswordLength: password.length,
        storedHashLength: user.passwordHash.length,
      });
      return isValid;
    } catch (error) {
      console.error("Error during password verification:", error);
      return false;
    }
  }

  async createStudentProfile(
    userId: string,
    data: {
      studentId: string;
      department: string;
      program: string;
      enrollmentYear: number;
    }
  ): Promise<StudentProfile> {
    return prisma.studentProfile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async createSupervisorProfile(
    userId: string,
    data: { department: string; specialization: string }
  ): Promise<SupervisorProfile> {
    return prisma.supervisorProfile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getUserWithProfile(id: string): Promise<UserWithProfiles | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        supervisorProfile: true,
      },
    });

    return user;
  }

  async getUserWithProfileByEmail(
    email: string
  ): Promise<UserWithProfiles | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        supervisorProfile: true,
      },
    });

    return user;
  }

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { passwordHash },
      });
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  async updateStudentProfile(
    userId: string,
    data: {
      studentId?: string;
      department?: string;
      program?: string;
      enrollmentYear?: number;
    }
  ): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { userId },
      data,
    });
  }
}

export const userService = new UserService();
