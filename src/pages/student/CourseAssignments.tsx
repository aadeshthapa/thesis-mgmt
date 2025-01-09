import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const { getAuthHeader, logout } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch assignments
      const assignmentsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/assignments`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800";
      case "GRADED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <Link
            to="/student/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="text-gray-600 mt-2">
          Submit your assignments in PDF or Word format (max 10MB)
        </p>
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
              className="bg-white shadow-sm border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {assignment.title}
                  </h3>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  {assignment.grade && (
                    <p className="mt-2 text-sm text-gray-600">
                      Grade: {assignment.grade}
                    </p>
                  )}
                  {assignment.feedback && (
                    <p className="mt-2 text-sm text-gray-600">
                      Feedback: {assignment.feedback}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {assignment.status === "PENDING" && (
                    <Link
                      to={`/student/courses/${courseId}/assignments/${assignment.id}/submit`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit
                    </Link>
                  )}
                  {assignment.fileUrl && (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${
                        assignment.fileUrl
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Submission
                    </a>
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
