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
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const courseService = {
  // Admin Methods
  getAllCourses: async (): Promise<Course[]> => {
    try {
      console.log("Fetching courses from:", `${API_URL}/api/courses`);

      // Use the original endpoint
      const response = await axios.get(`${API_URL}/api/courses`, {
        headers: {
          ...getAuthHeader(),
          "Include-Counts": "true", // Request enrollment counts from the API
        },
      });

      console.log(
        "Raw API response data:",
        JSON.stringify(response.data, null, 2)
      );

      const courses = response.data.map((course: any) => {
        console.log(`Processing course ${course.code}:`, {
          enrollments: course.enrollments,
          _count: course._count,
          rawCourse: course,
        });

        return {
          id: course.id,
          code: course.code,
          name: course.name,
          category: course.category,
          supervisors:
            course.supervisors?.map((s: any) => ({
              id: s.supervisor.id,
              firstName: s.supervisor.firstName,
              lastName: s.supervisor.lastName,
            })) || [],
          enrolledCount:
            course.enrolledCount ||
            course._count?.enrollments ||
            course.enrollments?.length ||
            0,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      });

      console.log(
        "Courses with enrollment counts:",
        courses.map((c: Course) => ({
          code: c.code,
          enrolledCount: c.enrolledCount,
        }))
      );

      return courses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error("API Error:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          config: axiosError.config,
        });
        if (axiosError.response?.status === 404) {
          return [];
        }
        throw error;
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
    await axios.post(
      `${API_URL}/api/admin/courses/${courseId}/supervisors`,
      { supervisorId },
      {
        headers: getAuthHeader(),
      }
    );
  },

  removeSupervisor: async (
    courseId: string,
    supervisorId: string
  ): Promise<void> => {
    await axios.delete(
      `${API_URL}/api/admin/courses/${courseId}/supervisors/${supervisorId}`,
      {
        headers: getAuthHeader(),
      }
    );
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
      if (!API_URL) {
        throw new Error("API URL is not configured");
      }

      const headers = getAuthHeader();
      if (!headers.Authorization) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/supervisor/courses`, {
        headers,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          return [];
        }
        if (axiosError.response?.status === 401) {
          throw new Error("Your session has expired. Please login again.");
        }
        console.error("API Error:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
        });
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
    const response = await axios.get(
      `${API_URL}/api/students/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
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
};
