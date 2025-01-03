import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

interface Assignment {
  id: string;
  title: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  grade?: number;
  feedback?: string;
  submissionDate?: string;
  fileUrl?: string;
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
    { id: "1", title: "Assignment 1", status: "PENDING" },
    { id: "2", title: "Assignment 2", status: "PENDING" },
    { id: "3", title: "Assignment 3", status: "PENDING" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submittingAssignments, setSubmittingAssignments] = useState<
    Record<string, boolean>
  >({});

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
      setSelectedFiles((prev) => ({
        ...prev,
        [assignmentId]: file,
      }));
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      toast.error("Please select a file to submit");
      return;
    }

    setSubmittingAssignments((prev) => ({
      ...prev,
      [assignmentId]: true,
    }));

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/assignments/${assignmentId}/submit`,
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

      const submittedAssignment = await response.json();

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                status: "SUBMITTED" as const,
                submissionDate: new Date().toISOString(),
                fileUrl: submittedAssignment.fileUrl,
              }
            : assignment
        )
      );

      // Clear the selected file for this assignment
      setSelectedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[assignmentId];
        return newFiles;
      });

      toast.success("Assignment submitted successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmittingAssignments((prev) => ({
        ...prev,
        [assignmentId]: false,
      }));
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
          {course?.name} ({course?.code}) - Assignments
        </h1>
      </div>

      {loading ? (
        <div className="text-center">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center text-gray-500">No assignments found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {assignment.title}
                    </h3>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.status === "GRADED"
                            ? "bg-green-100 text-green-800"
                            : assignment.status === "SUBMITTED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {assignment.status.charAt(0) +
                          assignment.status.slice(1).toLowerCase()}
                      </span>
                      {assignment.submissionDate && (
                        <span className="ml-2 text-sm text-gray-500">
                          Submitted:{" "}
                          {new Date(
                            assignment.submissionDate
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {assignment.status === "GRADED" && (
                      <div className="mt-3">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            Grade:{" "}
                          </span>
                          <span className="text-gray-700">
                            {assignment.grade}/100
                          </span>
                        </div>
                        {assignment.feedback && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-900">
                              Feedback:{" "}
                            </span>
                            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                              {assignment.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {assignment.status === "PENDING" ? (
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, assignment.id)}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          accept=".pdf,.doc,.docx"
                        />
                        <button
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={
                            submittingAssignments[assignment.id] ||
                            !selectedFiles[assignment.id]
                          }
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {submittingAssignments[assignment.id]
                            ? "Submitting..."
                            : "Submit"}
                        </button>
                      </div>
                    ) : assignment.fileUrl ? (
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Submission
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CourseAssignments;
