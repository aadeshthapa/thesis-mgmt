import { createUsersTable, createUser } from "./userService.js";

const initializeDatabase = async () => {
  try {
    // Create tables
    await createUsersTable();

    // Create initial users
    const initialUsers = [
      {
        email: "student@koi.edu.au",
        password: "student123",
        role: "student" as const,
        name: "John Student",
      },
      {
        email: "supervisor@koi.edu.au",
        password: "supervisor123",
        role: "supervisor" as const,
        name: "Jane Supervisor",
      },
      {
        email: "admin@koi.edu.au",
        password: "admin123",
        role: "admin" as const,
        name: "Admin User",
      },
    ];

    for (const user of initialUsers) {
      try {
        await createUser(user);
        console.log(`Created user: ${user.email}`);
      } catch (error: any) {
        // Skip if user already exists (unique constraint violation)
        if (error.code === "23505") {
          console.log(`User already exists: ${user.email}`);
        } else {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

// Run the initialization
initializeDatabase().catch(console.error);
