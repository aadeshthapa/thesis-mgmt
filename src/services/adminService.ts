import axios from "axios";
import { User } from "@prisma/client";

const API_URL = import.meta.env.VITE_API_URL;

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
}

export const adminService = new AdminService();
