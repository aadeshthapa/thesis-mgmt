import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
  enrolledCount: number;
  supervisors: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

export interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  return { Authorization: `Bearer ${token}` };
};

export const courseService = {
  // Admin Methods
  getAllCourses: async (): Promise<Course[]> => {
    try {
      console.log("Fetching courses from:", `${API_URL}/api/courses`);

      const response = await axios.get(`${API_URL}/api/courses`, {
        headers: {
          ...getAuthHeader(),
          "Include-Counts": "true" as string,
        },
      });

      console.log(
        "Raw API response data:",
        JSON.stringify(response.data, null, 2)
      );

      // Validate response data
      if (!Array.isArray(response.data)) {
        console.error("Invalid response data - expected array:", response.data);
        return [];
      }

      const courses = response.data
        .filter((course: any) => {
          if (!course || !course.id) {
            console.error("Invalid course data:", course);
            return false;
          }
          return true;
        })
        .map((course: any) => {
          console.log(`Processing course:`, JSON.stringify(course, null, 2));

          return {
            id: course.id,
            code: course.code || "",
            name: course.name || "",
            category: course.category || "",
            supervisors: Array.isArray(course.supervisors)
              ? course.supervisors.map((s: any) => ({
                  id: s.id,
                  firstName: s.firstName,
                  lastName: s.lastName,
                }))
              : [],
            enrolledCount: course._count?.enrollments || 0,
            createdAt: course.createdAt || new Date().toISOString(),
            updatedAt: course.updatedAt || new Date().toISOString(),
          };
        });

      console.log("Processed courses:", JSON.stringify(courses, null, 2));
      return courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          window.location.href = "/login";
          return [];
        }
        throw new Error(
          error.response?.data?.message || "Failed to fetch courses"
        );
      }
      throw error;
    }
  },

  createCourse: async (data: {
    code: string;
    name: string;
    category: string;
  }): Promise<Course> => {
    const response = await axios.post(`${API_URL}/api/courses`, data, {
      headers: getAuthHeader(),
    });
    return {
      ...response.data,
      supervisors: [],
      enrolledCount: 0,
    };
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    try {
      console.log("Deleting course:", courseId);

      // Delete the course (backend will handle enrollment deletion)
      const response = await axios.delete(
        `${API_URL}/api/courses/${courseId}`,
        {
          headers: getAuthHeader(),
        }
      );

      if (response.data && !response.data.success) {
        throw new Error(response.data.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Delete API Error Details:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers,
        });

        // Handle specific error cases
        switch (axiosError.response?.status) {
          case 403:
            throw new Error("You don't have permission to delete this course");
          case 404:
            throw new Error("Course not found or already deleted");
          case 400:
            throw new Error(
              axiosError.response.data?.message || "Invalid request"
            );
          case 409:
            throw new Error(
              "Cannot delete course. Please remove all enrollments and supervisors first."
            );
          default:
            throw new Error(
              axiosError.response?.data?.message || "Failed to delete course"
            );
        }
      }
      throw error;
    }
  },

  assignSupervisor: async (
    courseId: string,
    supervisorId: string
  ): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/api/courses/${courseId}/supervisors`,
        { supervisorId },
        {
          headers: getAuthHeader(),
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  removeSupervisor: async (
    courseId: string,
    supervisorId: string
  ): Promise<void> => {
    try {
      await axios.delete(
        `${API_URL}/api/courses/${courseId}/supervisors/${supervisorId}`,
        {
          headers: getAuthHeader(),
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  searchSupervisors: async (query: string): Promise<Supervisor[]> => {
    const response = await axios.get(
      `${API_URL}/api/admin/supervisors/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Supervisor Methods
  getSupervisorCourses: async (): Promise<Course[]> => {
    try {
      const response = await axios.get(
        `${API_URL}/api/courses/supervisor/courses`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data.map((course: any) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        category: course.category,
        enrolledCount: course._count?.enrollments || 0,
        supervisors: course.supervisors || [],
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Your session has expired. Please login again.");
        }
        throw new Error(
          error.response?.data?.message || "Failed to fetch courses"
        );
      }
      throw error;
    }
  },

  // Common Methods
  getCourseStudents: async (courseId: string): Promise<Student[]> => {
    const response = await axios.get(
      `${API_URL}/api/courses/${courseId}/students`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  searchStudents: async (query: string): Promise<Student[]> => {
    try {
      console.log(
        "Searching students with URL:",
        `${API_URL}/api/students/search?q=${encodeURIComponent(query)}`
      );
      const response = await axios.get(
        `${API_URL}/api/students/search?q=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeader(),
        }
      );
      console.log("Search response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Search students error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  enrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    try {
      console.log("Enrolling student:", studentId, "in course:", courseId);
      const response = await axios.post(
        `${API_URL}/api/courses/${courseId}/students`,
        { studentId },
        {
          headers: getAuthHeader(),
        }
      );
      console.log("Enrollment response:", response.data);
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  },

  removeStudent: async (courseId: string, studentId: string): Promise<void> => {
    await axios.delete(
      `${API_URL}/api/courses/${courseId}/students/${studentId}`,
      {
        headers: getAuthHeader(),
      }
    );
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}`, {
      headers: getAuthHeader(),
    });
    const course = response.data;
    return {
      id: course.id,
      code: course.code || "",
      name: course.name || "",
      category: course.category || "",
      supervisors: Array.isArray(course.supervisors)
        ? course.supervisors.map((s: any) => ({
            id: s.supervisor.id,
            firstName: s.supervisor.firstName,
            lastName: s.supervisor.lastName,
          }))
        : [],
      enrolledCount: course._count?.enrollments || 0,
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt || new Date().toISOString(),
    };
  },

  addAssignments: async (courseId: string): Promise<void> => {
    const assignments = ["Project Proposal", "Progress Report", "Final Report"];

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/assignments/course/${courseId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ assignments }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add assignments");
    }
  },
};
