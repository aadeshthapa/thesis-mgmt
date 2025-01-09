import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import AddAssignmentModal from "../../components/AddAssignmentModal";
import EditInstructionsModal from "../../components/EditInstructionsModal";
import SupervisorLayout from "../../components/layout/SupervisorLayout";

interface Assignment {
  id: string;
  title: string;
  instructions: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentInstructions, setNewAssignmentInstructions] =
    useState("");
  const [editInstructionsModal, setEditInstructionsModal] = useState<{
    isOpen: boolean;
    assignmentId: string;
    instructions: string;
  }>({
    isOpen: false,
    assignmentId: "",
    instructions: "",
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

  const handleCreateAssignment = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            title: newAssignmentTitle,
            instructions: newAssignmentInstructions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }

      toast.success("Assignment created successfully");
      setIsModalOpen(false);
      setNewAssignmentTitle("");
      setNewAssignmentInstructions("");
      fetchCourseAndAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
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
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
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

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {assignment.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {assignment.submissions.length} submissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        setEditInstructionsModal({
                          isOpen: true,
                          assignmentId: assignment.id,
                          instructions: assignment.instructions || "",
                        })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Instructions
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteClick(assignment.id, assignment.title)
                      }
                      disabled={isDeleting[assignment.id]}
                      className="text-red-600 hover:text-red-800"
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
              </li>
            ))}
          </ul>
        </div>

        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          courseId={courseId!}
          onAssignmentAdded={fetchCourseAndAssignments}
        />

        <EditInstructionsModal
          isOpen={editInstructionsModal.isOpen}
          onClose={() =>
            setEditInstructionsModal({
              isOpen: false,
              assignmentId: "",
              instructions: "",
            })
          }
          courseId={courseId!}
          assignmentId={editInstructionsModal.assignmentId}
          currentInstructions={editInstructionsModal.instructions}
          onInstructionsUpdated={fetchCourseAndAssignments}
        />

        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Assignment
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{deleteConfirmation.title}
                    "? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
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
    </SupervisorLayout>
  );
};

export default CourseAssignmentSubmissions;
