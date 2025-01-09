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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submittingAssignments, setSubmittingAssignments] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchCourseAndAssignments = async () => {
      try {
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

        const assignmentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assignments/course/${courseId}`,
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
      // Validate file type
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const fileExt = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        toast.error("Only PDF and Word documents are allowed");
        e.target.value = "";
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = "";
        return;
      }

      setSelectedFiles((prev) => ({
        ...prev,
        [assignmentId]: file,
      }));
      toast.info(`File "${file.name}" selected`);
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
        <p className="mt-2 text-gray-600">
          Submit your assignments in PDF or Word format (max 10MB)
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg shadow p-6">
          No assignments found for this course
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <div className="mb-4">
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
                    </div>

                    {assignment.status === "GRADED" && (
                      <div className="mb-4">
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

                    {assignment.submissionDate && (
                      <div className="text-sm text-gray-500 mb-4">
                        Submitted:{" "}
                        {new Date(
                          assignment.submissionDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {assignment.status === "PENDING" && (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Upload Assignment
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, assignment.id)}
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          accept=".pdf,.doc,.docx"
                        />
                        {selectedFiles[assignment.id] && (
                          <p className="text-sm text-gray-600">
                            Selected: {selectedFiles[assignment.id].name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleSubmit(assignment.id)}
                        disabled={
                          submittingAssignments[assignment.id] ||
                          !selectedFiles[assignment.id]
                        }
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                          submittingAssignments[assignment.id] ||
                          !selectedFiles[assignment.id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors duration-200`}
                      >
                        {submittingAssignments[assignment.id]
                          ? "Submitting..."
                          : "Submit Assignment"}
                      </button>
                    </div>
                  )}

                  {assignment.status === "SUBMITTED" && assignment.fileUrl && (
                    <div className="mt-4">
                      <a
                        href={`${import.meta.env.VITE_API_URL}/${
                          assignment.fileUrl
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Submitted File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseAssignments;
