import axios from "axios";
import {
  ThesisSubmissionRequest,
  Thesis,
  ThesisError,
} from "../types/thesis.types";

// Using Vite's environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: ThesisError[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Add centralized error handling
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (axios.isAxiosError(error) && error.response) {
    throw new ApiError(
      error.response.data.message || defaultMessage,
      error.response.status,
      error.response.data.errors
    );
  }
  throw new Error(defaultMessage);
};

export const thesisService = {
  async submitThesis(
    data: ThesisSubmissionRequest
  ): Promise<Thesis | undefined> {
    try {
      // First, get a pre-signed URL for file upload
      const { data: uploadData } = await axios.post(
        `${API_BASE_URL}/thesis/upload-url`,
        {
          fileName: data.file.name,
          fileType: data.file.type,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Upload the file to the pre-signed URL
      await axios.put(uploadData.url, data.file, {
        headers: {
          "Content-Type": data.file.type,
        },
      });

      // Submit the thesis with the file URL
      const { data: thesis } = await axios.post(
        `${API_BASE_URL}/thesis`,
        {
          title: data.title,
          year: data.year,
          abstract: data.abstract,
          fileUrl: uploadData.fileUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      return thesis;
    } catch (error) {
      handleApiError(error, "Failed to submit thesis");
      return undefined;
    }
  },

  async getTheses(): Promise<Thesis[] | undefined> {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/thesis`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return data;
    } catch (error) {
      handleApiError(error, "Failed to fetch theses");
      return undefined;
    }
  },

  async getThesisById(id: string): Promise<Thesis | undefined> {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/thesis/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return data;
    } catch (error) {
      handleApiError(error, "Failed to fetch thesis");
      return undefined;
    }
  },
};
