import axios from "axios";
import { User } from "@prisma/client";

const API_URL = import.meta.env.VITE_API_URL;

interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "SUPERVISOR";
  department?: string;
  specialization?: string;
  studentId?: string;
}

interface CreateUserResponse extends User {
  temporaryPassword: string;
}

class AdminService {
  async getAllStudents(): Promise<User[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      console.log("Fetching students from:", `${API_URL}/api/admin/students`);
      const response = await axios.get(`${API_URL}/api/admin/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Students response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  async getAllSupervisors(): Promise<User[]> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      console.log(
        "Fetching supervisors from:",
        `${API_URL}/api/admin/supervisors`
      );
      const response = await axios.get(`${API_URL}/api/admin/supervisors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Supervisors response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  async createUser(data: CreateUserData): Promise<CreateUserResponse> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating user with data:", data);
    console.log("Using auth token:", token.substring(0, 20) + "...");

    try {
      const response = await axios.post(`${API_URL}/api/admin/users`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Create user response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating user:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }
}

export const adminService = new AdminService();
