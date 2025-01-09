import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";
import SupervisorLayout from "../../components/layout/SupervisorLayout";

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courseCount, setCourseCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await courseService.getSupervisorCourses();
        setCourseCount(courses.length);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {user?.firstName}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            <Link to="/supervisor/courses" className="block">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-4">
                    <svg
                      className="h-8 w-8 text-white"
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
                  <div className="ml-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      Assigned Courses
                    </h2>
                    <div className="mt-2">
                      <span className="text-3xl font-semibold text-purple-600">
                        {loading ? "..." : courseCount}
                      </span>
                      <span className="ml-2 text-base text-gray-500">
                        {courseCount === 1 ? "Course" : "Courses"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            <Link to="/supervisor/assignment-reviews" className="block">
              <div className="p-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-4">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <h2 className="text-xl font-medium text-gray-900">
                      Assignment Reviews
                    </h2>
                    <p className="mt-2 text-base text-gray-500">
                      Review and grade student assignments
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorDashboard;
