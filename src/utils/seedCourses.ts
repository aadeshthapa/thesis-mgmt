const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sampleCourses = [
  {
    code: "ICT302",
    name: "Information Technology Project 2 T324",
    category: "School of Information Technology_T324",
  },
  {
    code: "ICT373",
    name: "Cloud Computing T324",
    category: "School of Information Technology_T324",
  },
  {
    code: "ICT372",
    name: "Mobile Computing T324",
    category: "School of Information Technology_T324",
  },
  {
    code: "ICT275",
    name: "Innovation and Technology Management T324",
    category: "School of Information Technology_T324",
  },
  {
    code: "ICT274",
    name: "E-commerce T224",
    category: "School of Information Technology_T224",
  },
  {
    code: "ICT271",
    name: "Artificial Intelligence T224",
    category: "School of Information Technology_T224",
  },
];

async function seedCourses() {
  try {
    // Find the student by first name
    const student = await prisma.user.findFirst({
      where: { firstName: "Anurodh" },
    });

    if (!student) {
      console.error(
        "Student not found. Please make sure Anurodh exists in the database."
      );
      return;
    }

    console.log(
      `Found student: ${student.firstName} ${student.lastName} (${student.email})`
    );

    // Create or find courses and enroll the student
    for (const courseData of sampleCourses) {
      // Try to find existing course
      let course = await prisma.course.findUnique({
        where: { code: courseData.code },
      });

      // Create course if it doesn't exist
      if (!course) {
        course = await prisma.course.create({
          data: courseData,
        });
        console.log(`Created new course: ${course.code}`);
      } else {
        console.log(`Found existing course: ${course.code}`);
      }

      // Check if student is already enrolled
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: student.id,
          courseId: course.id,
        },
      });

      // Enroll student if not already enrolled
      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
          },
        });
        console.log(`Enrolled student in course: ${course.code}`);
      } else {
        console.log(`Student already enrolled in course: ${course.code}`);
      }
    }

    console.log("Successfully completed course setup");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCourses();
