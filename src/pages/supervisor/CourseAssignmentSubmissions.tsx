import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import AddAssignmentModal from "../../components/AddAssignmentModal";

interface Assignment {
  id: string;
  title: string;
  submissions: {
    id: string;
    student: {
      firstName: string;
      lastName: string;
    };
    status: "PENDING" | "SUBMITTED" | "GRADED";
    grade?: number;
    feedback?: string;
    submissionDate: string;
    fileUrl: string;
  }[];
}

interface Course {
  id: string;
  code: string;
  name: string;
}

const CourseAssignmentSubmissions: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assignmentId: string | null;
    title: string;
  }>({
    isOpen: false,
    assignmentId: null,
    title: "",
  });

  const fetchCourseAndAssignments = async () => {
    try {
      const headers = getAuthHeader();

      // Check if we have a valid auth header
      if (!("Authorization" in headers)) {
        toast.error("Authentication token missing. Please log in again.");
        logout();
        navigate("/login");
        return;
      }

      // Fetch course details
      const courseResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}`,
        {
          headers,
        }
      );

      if (courseResponse.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/login");
        return;
      }

      if (!courseResponse.ok) {
        throw new Error(
          `Failed to fetch course details: ${courseResponse.statusText}`
        );
      }

      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Fetch assignments with submissions
      const assignmentsResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/courses/${courseId}/assignments/submissions`,
        {
          headers,
        }
      );

      if (assignmentsResponse.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
        navigate("/login");
        return;
      }

      if (!assignmentsResponse.ok) {
        throw new Error(
          `Failed to fetch assignments: ${assignmentsResponse.statusText}`
        );
      }

      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load course details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndAssignments();
  }, [courseId, getAuthHeader, logout, navigate]);

  const handleDeleteClick = (assignmentId: string, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      assignmentId,
      title,
    });
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setIsDeleting((prev) => ({ ...prev, [assignmentId]: true }));

    try {
      console.log("Attempting to delete assignment:", assignmentId);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/courses/${courseId}/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response status:", response.status);

      let errorData: { message?: string } = {};
      try {
        const textResponse = await response.text();
        console.log("Raw response:", textResponse);

        if (textResponse) {
          errorData = JSON.parse(textResponse);
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
      }

      if (!response.ok) {
        console.error("Delete failed with status:", response.status, errorData);
        throw new Error(
          errorData.message ||
            `Failed to delete assignment (${response.status})`
        );
      }

      toast.success("Assignment deleted successfully");
      // Remove the assignment from the state
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error(
        error instanceof Error ? error.message : "Failed to delete assignment"
      );
    } finally {
      setIsDeleting((prev) => ({ ...prev, [assignmentId]: false }));
      setDeleteConfirmation({ isOpen: false, assignmentId: null, title: "" });
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {course?.name} ({course?.code}) - Assignments
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Assignment
            </button>
            <Link
              to="/supervisor/courses"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg shadow p-6">
          No assignments found for this course
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white shadow-sm border border-gray-200 rounded-lg"
            >
              <div className="px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {assignment.title}
                </h3>
                <button
                  onClick={() =>
                    handleDeleteClick(assignment.id, assignment.title)
                  }
                  disabled={isDeleting[assignment.id]}
                  className={`text-red-600 hover:text-red-800 ${
                    isDeleting[assignment.id]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isDeleting[assignment.id] ? (
                    <span>Deleting...</span>
                  ) : (
                    <span className="flex items-center">
                      <svg
                        className="h-5 w-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        courseId={courseId || ""}
        onAssignmentAdded={fetchCourseAndAssignments}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete Assignment
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteConfirmation.title}"?
                  This will also delete all student submissions.
                </p>
              </div>
              <div className="flex justify-end space-x-3 px-4 py-3">
                <button
                  onClick={() =>
                    setDeleteConfirmation({
                      isOpen: false,
                      assignmentId: null,
                      title: "",
                    })
                  }
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    deleteConfirmation.assignmentId &&
                    handleDeleteAssignment(deleteConfirmation.assignmentId)
                  }
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignmentSubmissions;
