import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { thesisService } from "../../services/thesis.service";
import { ThesisError } from "../../types/thesis.types";
import { toast } from "react-toastify";

interface FormData {
  title: string;
  year: string;
  abstract: string;
  file: File | null;
}

interface FormErrors {
  title?: string;
  year?: string;
  abstract?: string;
  file?: string;
}

const ThesisSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    year: new Date().getFullYear().toString(),
    abstract: "",
    file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.year) {
      newErrors.year = "Year is required";
    }

    if (!formData.abstract.trim()) {
      newErrors.abstract = "Abstract is required";
    }

    if (!formData.file) {
      newErrors.file = "Please upload a thesis file";
    } else {
      const fileExtension = formData.file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx"].includes(fileExtension || "")) {
        newErrors.file = "Only PDF and DOCX files are allowed";
      } else if (formData.file.size > 10 * 1024 * 1024) {
        // 10MB limit
        newErrors.file = "File size must be less than 10MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
    if (errors.file) {
      setErrors((prev) => ({
        ...prev,
        file: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await thesisService.submitThesis({
        title: formData.title,
        year: formData.year,
        abstract: formData.abstract,
        file: formData.file!,
      });

      toast.success("Thesis submitted successfully!");
      navigate("/student/my-submissions");
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific API errors
        if (error.errors) {
          const newErrors: FormErrors = {};
          error.errors.forEach((err: ThesisError) => {
            if (err.field) {
              newErrors[err.field as keyof FormErrors] = err.message;
            }
          });
          setErrors(newErrors);
        }
        toast.error(error.message);
      } else {
        toast.error("Failed to submit thesis. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Submit Thesis</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Thesis Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.title ? "border-red-300" : "border-gray-300"
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Year of Submission
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.year ? "border-red-300" : "border-gray-300"
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* Abstract */}
        <div>
          <label
            htmlFor="abstract"
            className="block text-sm font-medium text-gray-700"
          >
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            rows={4}
            value={formData.abstract}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.abstract ? "border-red-300" : "border-gray-300"
            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
          />
          {errors.abstract && (
            <p className="mt-1 text-sm text-red-600">{errors.abstract}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Thesis File (PDF or DOCX, max 10MB)
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isSubmitting
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isSubmitting ? "Submitting..." : "Submit Thesis"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThesisSubmission;
