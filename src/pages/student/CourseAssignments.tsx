import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

interface Assignment {
  id: string;
  title: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  feedback?: string;
  submissionDate?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

const CourseAssignments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { getAuthHeader } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: "1", title: "Assignment 1", status: "pending" },
    { id: "2", title: "Assignment 2", status: "pending" },
    { id: "3", title: "Assignment 3", status: "pending" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourseAndAssignments = async () => {
      try {
        // Fetch course details
        const courseResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/courses/${courseId}`,
          {
            headers: {
              ...getAuthHeader(),
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course details");
        }

        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch assignments
        const assignmentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/assignments`,
          {
            headers: {
              ...getAuthHeader(),
            },
          }
        );

        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndAssignments();
  }, [courseId, getAuthHeader]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    assignmentId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedFile) {
      toast.error("Please select a file to submit");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/courses/${courseId}/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            ...getAuthHeader(),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit assignment");
      }

      // Update the assignment status in the local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                status: "submitted",
                submissionDate: new Date().toISOString(),
              }
            : assignment
        )
      );

      toast.success("Assignment submitted successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {course?.name} ({course?.code})
        </h1>
        <p className="text-gray-600 mt-2">Submit your assignments below</p>
      </div>

      <div className="space-y-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {assignment.title}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assignment.status === "submitted"
                    ? "bg-yellow-100 text-yellow-800"
                    : assignment.status === "graded"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {assignment.status.charAt(0).toUpperCase() +
                  assignment.status.slice(1)}
              </span>
            </div>

            {assignment.status === "graded" ? (
              <div className="space-y-2">
                <p className="text-gray-600">Grade: {assignment.grade}</p>
                {assignment.feedback && (
                  <p className="text-gray-600">
                    Feedback: {assignment.feedback}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {assignment.submissionDate && (
                  <p className="text-sm text-gray-500">
                    Submitted on:{" "}
                    {new Date(assignment.submissionDate).toLocaleDateString()}
                  </p>
                )}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, assignment.id)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept=".pdf,.doc,.docx"
                    disabled={submitting || assignment.status === "submitted"}
                  />
                  <button
                    onClick={() => handleSubmit(assignment.id)}
                    disabled={
                      !selectedFile ||
                      submitting ||
                      assignment.status === "submitted"
                    }
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      !selectedFile ||
                      submitting ||
                      assignment.status === "submitted"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseAssignments;
