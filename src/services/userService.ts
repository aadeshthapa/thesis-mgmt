import { PrismaClient, User, UserRole } from "@prisma/client";
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

class UserService {
  async createUser(data: CreateUserInput): Promise<Omit<User, "passwordHash">> {
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

    const user = await prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUser(
    id: string,
    data: UpdateUserInput
  ): Promise<Omit<User, "passwordHash">> {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
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
  ) {
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
  ) {
    return prisma.supervisorProfile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async createAdminProfile(
    userId: string,
    data: {
      department: string;
      position: string;
      permissions: string[];
    }
  ) {
    return prisma.adminProfile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getUserWithProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        supervisorProfile: true,
        adminProfile: true,
      },
    });

    if (!user) return null;

    // Remove passwordHash from the response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserWithProfileByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        supervisorProfile: true,
        adminProfile: true,
      },
    });

    if (!user) return null;

    // Remove passwordHash from the response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
}

export const userService = new UserService();
