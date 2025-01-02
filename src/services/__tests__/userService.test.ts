import { userService } from "../userService";
import { UserRole } from "@prisma/client";

describe("UserService", () => {
  const testUser = {
    email: "test@example.com",
    password: "testpassword123",
    firstName: "Test",
    lastName: "User",
    role: UserRole.STUDENT,
  };

  let userId: string;

  // Clean up before tests
  beforeAll(async () => {
    try {
      const existingUser = await userService.getUserByEmail(testUser.email);
      if (existingUser) {
        await userService.deleteUser(existingUser.id);
      }
    } catch (error) {
      console.error("Error in cleanup:", error);
    }
  });

  // Clean up after tests
  afterAll(async () => {
    try {
      if (userId) {
        await userService.deleteUser(userId);
      }
    } catch (error) {
      console.error("Error in cleanup:", error);
    }
  });

  it("should create a new user", async () => {
    const user = await userService.createUser(testUser);
    userId = user.id;

    expect(user).toBeDefined();
    expect(user.email).toBe(testUser.email);
    expect(user.firstName).toBe(testUser.firstName);
    expect(user.lastName).toBe(testUser.lastName);
    expect(user.role).toBe(testUser.role);
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("should get user by email", async () => {
    const user = await userService.getUserByEmail(testUser.email);

    expect(user).toBeDefined();
    expect(user?.email).toBe(testUser.email);
  });

  it("should get user by id", async () => {
    const user = await userService.getUserById(userId);

    expect(user).toBeDefined();
    expect(user?.id).toBe(userId);
    expect(user?.email).toBe(testUser.email);
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("should verify password", async () => {
    const isValid = await userService.verifyPassword(
      testUser.email,
      testUser.password
    );
    expect(isValid).toBe(true);

    const isInvalid = await userService.verifyPassword(
      testUser.email,
      "wrongpassword"
    );
    expect(isInvalid).toBe(false);
  });

  it("should update user", async () => {
    const updatedUser = await userService.updateUser(userId, {
      firstName: "Updated",
      lastName: "Name",
    });

    expect(updatedUser.firstName).toBe("Updated");
    expect(updatedUser.lastName).toBe("Name");
    expect(updatedUser.email).toBe(testUser.email);
  });

  it("should create student profile", async () => {
    const studentProfile = await userService.createStudentProfile(userId, {
      studentId: "ST123",
      department: "Computer Science",
      program: "Masters",
      enrollmentYear: 2024,
    });

    expect(studentProfile).toBeDefined();
    expect(studentProfile.userId).toBe(userId);
    expect(studentProfile.studentId).toBe("ST123");
  });

  it("should delete user", async () => {
    const isDeleted = await userService.deleteUser(userId);
    expect(isDeleted).toBe(true);

    const user = await userService.getUserById(userId);
    expect(user).toBeNull();
  });

  it("should create admin profile", async () => {
    const adminUser = await userService.createUser({
      email: "admin@example.com",
      password: "adminpass123",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    });

    const adminProfile = await userService.createAdminProfile(adminUser.id, {
      department: "IT",
      position: "System Administrator",
      permissions: ["MANAGE_USERS", "MANAGE_THESIS", "MANAGE_SYSTEM"],
    });

    expect(adminProfile).toBeDefined();
    expect(adminProfile.userId).toBe(adminUser.id);
    expect(adminProfile.department).toBe("IT");
    expect(adminProfile.position).toBe("System Administrator");
    expect(adminProfile.permissions).toContain("MANAGE_USERS");

    // Clean up
    await userService.deleteUser(adminUser.id);
  });

  it("should get user with profile", async () => {
    // Create a user with admin profile
    const adminUser = await userService.createUser({
      email: "admin2@example.com",
      password: "adminpass123",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    });

    await userService.createAdminProfile(adminUser.id, {
      department: "IT",
      position: "System Administrator",
      permissions: ["MANAGE_USERS"],
    });

    // Get user with profile
    const userWithProfile = await userService.getUserWithProfile(adminUser.id);

    expect(userWithProfile).toBeDefined();
    expect(userWithProfile?.adminProfile).toBeDefined();
    expect(userWithProfile?.adminProfile?.department).toBe("IT");
    expect(userWithProfile?.adminProfile?.position).toBe(
      "System Administrator"
    );
    expect(userWithProfile).not.toHaveProperty("passwordHash");

    // Clean up
    await userService.deleteUser(adminUser.id);
  });
});
