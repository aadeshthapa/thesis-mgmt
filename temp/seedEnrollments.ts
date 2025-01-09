import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedEnrollments() {
  try {
    // Create enrollment for Anurodh in ICT274
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: "318736e2-fa52-47e4-9c75-8c4aa32bd4ae", // Anurodh's ID
        courseId: "15c32e03-1886-420a-bb4a-a193f32a484f", // ICT274's ID
      },
    });

    console.log("Created enrollment:", enrollment);
  } catch (error) {
    console.error("Error seeding enrollments:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEnrollments();
