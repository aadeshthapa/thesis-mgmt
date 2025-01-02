import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface Course {
  id: string;
  code: string;
  name: string;
  enrolledCount: number;
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const courseService = {
  // Get courses for supervisor
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
          // Return empty array for 404 (no courses found)
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

  // Get enrolled students for a course
  getCourseStudents: async (courseId: string): Promise<Student[]> => {
    const response = await axios.get(
      `${API_URL}/api/supervisor/courses/${courseId}/students`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Search students for enrollment
  searchStudents: async (query: string): Promise<Student[]> => {
    const response = await axios.get(
      `${API_URL}/api/supervisor/students/search?q=${encodeURIComponent(
        query
      )}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Enroll a student in a course
  enrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    await axios.post(
      `${API_URL}/api/supervisor/courses/${courseId}/students`,
      { studentId },
      {
        headers: getAuthHeader(),
      }
    );
  },

  // Remove a student from a course
  removeStudent: async (courseId: string, studentId: string): Promise<void> => {
    await axios.delete(
      `${API_URL}/api/supervisor/courses/${courseId}/students/${studentId}`,
      {
        headers: getAuthHeader(),
      }
    );
  },
};
