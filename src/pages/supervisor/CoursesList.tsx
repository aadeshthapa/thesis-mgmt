import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { toast } from "react-toastify";

const CoursesList: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState<
    Array<{
      id: string;
      code: string;
      name: string;
      enrolledCount: number;
    }>
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getSupervisorCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error instanceof Error) {
        if (error.message === "Your session has expired. Please login again.") {
          toast.error("Your session has expired. Please login again.");
          navigate("/login");
          return;
        }
        if (error.message === "No authentication token found") {
          toast.error("Please login to access your courses.");
          navigate("/login");
          return;
        }
        setError(error.message);
      } else {
        setError("Failed to load courses. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, [navigate]);

  const handleRetry = () => {
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your assigned courses and assignments
            </p>
          </div>
          <Link
            to="/supervisor/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-8 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-8 bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No courses assigned yet</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {course.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 font-medium">
                        {course.code}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-end space-x-4">
                      <Link
                        to={`/supervisor/courses/${course.id}/students`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                      >
                        Manage Students
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </Link>
                      <div className="text-gray-300">|</div>
                      <Link
                        to={`/supervisor/courses/${course.id}/assignments`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                      >
                        View Assignments
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
