import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

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
  const { getAuthHeader } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Fetch assignments with submissions
        const assignmentsResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/courses/${courseId}/assignments/submissions`,
          {
            headers: {
              ...getAuthHeader(),
            },
          }
        );

        if (!assignmentsResponse.ok) {
          throw new Error("Failed to fetch assignments");
        }

        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndAssignments();
  }, [courseId, getAuthHeader]);

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
            to="/supervisor/courses"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Courses
          </Link>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg shadow p-6">
          No assignments found for this course
        </div>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {assignment.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {assignment.submissions.length} submissions
                </p>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignment.submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {`${submission.student.firstName} ${submission.student.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.status === "GRADED"
                                ? "bg-green-100 text-green-800"
                                : submission.status === "SUBMITTED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {submission.status.charAt(0) +
                              submission.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            submission.submissionDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.grade ? `${submission.grade}/100` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-4">
                            {submission.fileUrl && (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Submission
                              </a>
                            )}
                            {submission.status === "SUBMITTED" && (
                              <Link
                                to={`/supervisor/assignment-reviews?submissionId=${submission.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Grade
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseAssignmentSubmissions;
