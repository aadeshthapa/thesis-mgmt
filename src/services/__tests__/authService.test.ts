import { authService } from "../authService";
import { userService } from "../userService";
import type { User } from "@prisma/client";

type UserWithProfile = Omit<User, "passwordHash"> & {
  studentProfile?: {
    studentId: string;
    department: string;
    program: string;
    enrollmentYear: number;
  } | null;
  supervisorProfile?: {
    department: string;
    specialization: string;
  } | null;
  adminProfile?: {
    department: string;
    position: string;
    permissions: string[];
  } | null;
};

describe("AuthService", () => {
  // Clean up test users after each test
  afterEach(async () => {
    const testEmails = [
      "student@example.com",
      "supervisor@example.com",
      "admin@example.com",
    ];

    for (const email of testEmails) {
      const user = await userService.getUserByEmail(email);
      if (user) {
        await userService.deleteUser(user.id);
      }
    }
  });

  it("should register a student and login", async () => {
    // Register student
    const studentData = {
      email: "student@example.com",
      password: "password123",
      firstName: "Student",
      lastName: "Test",
      role: "STUDENT" as const,
      studentId: "ST123",
      department: "Computer Science",
      program: "Masters",
      enrollmentYear: 2024,
    };

    const registeredStudent = (await authService.register(
      studentData
    )) as UserWithProfile;
    expect(registeredStudent).toBeDefined();
    expect(registeredStudent.email).toBe(studentData.email);
    expect(registeredStudent.studentProfile).toBeDefined();
    expect(registeredStudent.studentProfile?.studentId).toBe(
      studentData.studentId
    );

    // Test login
    const loggedInStudent = (await authService.login(
      studentData.email,
      studentData.password
    )) as UserWithProfile;
    expect(loggedInStudent).toBeDefined();
    expect(loggedInStudent.email).toBe(studentData.email);
    expect(loggedInStudent.studentProfile).toBeDefined();
  });

  it("should register a supervisor and login", async () => {
    // Register supervisor
    const supervisorData = {
      email: "supervisor@example.com",
      password: "password123",
      firstName: "Supervisor",
      lastName: "Test",
      role: "SUPERVISOR" as const,
      department: "Computer Science",
      specialization: "Machine Learning",
    };

    const registeredSupervisor = (await authService.register(
      supervisorData
    )) as UserWithProfile;
    expect(registeredSupervisor).toBeDefined();
    expect(registeredSupervisor.email).toBe(supervisorData.email);
    expect(registeredSupervisor.supervisorProfile).toBeDefined();
    expect(registeredSupervisor.supervisorProfile?.specialization).toBe(
      supervisorData.specialization
    );

    // Test login
    const loggedInSupervisor = (await authService.login(
      supervisorData.email,
      supervisorData.password
    )) as UserWithProfile;
    expect(loggedInSupervisor).toBeDefined();
    expect(loggedInSupervisor.email).toBe(supervisorData.email);
    expect(loggedInSupervisor.supervisorProfile).toBeDefined();
  });

  it("should register an admin and login", async () => {
    // Register admin
    const adminData = {
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "Test",
      role: "ADMIN" as const,
      department: "IT",
      position: "System Administrator",
      permissions: ["MANAGE_USERS", "MANAGE_SYSTEM"],
    };

    const registeredAdmin = (await authService.register(
      adminData
    )) as UserWithProfile;
    expect(registeredAdmin).toBeDefined();
    expect(registeredAdmin.email).toBe(adminData.email);
    expect(registeredAdmin.adminProfile).toBeDefined();
    expect(registeredAdmin.adminProfile?.permissions).toContain("MANAGE_USERS");

    // Test login
    const loggedInAdmin = (await authService.login(
      adminData.email,
      adminData.password
    )) as UserWithProfile;
    expect(loggedInAdmin).toBeDefined();
    expect(loggedInAdmin.email).toBe(adminData.email);
    expect(loggedInAdmin.adminProfile).toBeDefined();
  });

  it("should fail login with wrong password", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: "STUDENT" as const,
      studentId: "ST123",
      department: "Computer Science",
      program: "Masters",
      enrollmentYear: 2024,
    };

    await authService.register(userData);

    await expect(
      authService.login(userData.email, "wrongpassword")
    ).rejects.toThrow("Invalid credentials");
  });
});
