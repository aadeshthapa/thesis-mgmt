import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";
import { adminService } from "../../services/adminService";
import AddUserModal from "./AddUserModal";
import { toast } from "react-toastify";
import AdminLayout from "../../components/layout/AdminLayout";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [totalCourses, setTotalCourses] = React.useState<number>(0);
  const [totalStudents, setTotalStudents] = React.useState<number>(0);
  const [totalSupervisors, setTotalSupervisors] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);

  const fetchUserCounts = async () => {
    try {
      const [students, supervisors] = await Promise.all([
        adminService.getAllStudents(),
        adminService.getAllSupervisors(),
      ]);
      setTotalStudents(students.length);
      setTotalSupervisors(supervisors.length);
    } catch (error) {
      console.error("Error fetching user counts:", error);
    }
  };

  React.useEffect(() => {
    const fetchCourseCount = async () => {
      try {
        const courses = await courseService.getAllCourses();
        console.log("Fetched courses:", courses);
        setTotalCourses(courses.length);
      } catch (error) {
        console.error("Error fetching course count:", error);
        if (error instanceof Error) {
          toast.error(`Failed to fetch courses: ${error.message}`);
        } else {
          toast.error("Failed to fetch courses");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseCount();
  }, []);

  React.useEffect(() => {
    fetchUserCounts();
  }, []);

  const handleAddUserSuccess = () => {
    toast.success("User created successfully!");
    // Refresh the counts
    fetchUserCounts();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <Link to="/admin/courses" className="block">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
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
                    <div className="ml-5">
                      <h2 className="text-lg font-medium text-gray-900">
                        Manage Courses
                      </h2>
                      <div className="mt-1">
                        <span className="text-2xl font-semibold text-purple-600">
                          {loading ? "..." : totalCourses}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Total Courses
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <Link to="/admin/students" className="block">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h2 className="text-lg font-medium text-gray-900">
                        Total Students
                      </h2>
                      <div className="mt-1">
                        <span className="text-2xl font-semibold text-blue-600">
                          {totalStudents}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <Link to="/admin/supervisors" className="block">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h2 className="text-lg font-medium text-gray-900">
                        Total Supervisors
                      </h2>
                      <div className="mt-1">
                        <span className="text-2xl font-semibold text-green-600">
                          {totalSupervisors}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleAddUserSuccess}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
