import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";
import { toast } from "react-toastify";
import type { Course } from "../../services/courseService";
import axios from "axios";
import { AxiosError } from "axios";
import AddSupervisorModal from "../../components/AddSupervisorModal";
import AddAssignmentModal from "../../components/AddAssignmentModal";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    code: string;
    name: string;
    category: string;
  }) => Promise<void>;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit({ code, name, category });
      setCode("");
      setName("");
      setCategory("");
      onClose();
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[480px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Add New Course
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Course Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., CSE101"
              required
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Course Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., School of Computer Science"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CoursesList: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(
    null
  );
  const [isAddSupervisorModalOpen, setIsAddSupervisorModalOpen] =
    React.useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] =
    React.useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching courses...");
      const data = await courseService.getAllCourses();
      console.log("Courses fetched:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "An error occurred";
        setError(`Failed to load courses: ${errorMessage}`);
      } else if (error instanceof Error) {
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
  }, []);

  const handleRemoveSupervisor = async (
    courseId: string,
    supervisorId: string
  ) => {
    try {
      await courseService.removeSupervisor(courseId, supervisorId);
      toast.success("Supervisor removed successfully");
      // Refresh the course list
      fetchCourses();
    } catch (error) {
      console.error("Error removing supervisor:", error);
      toast.error("Failed to remove supervisor. Please try again.");
    }
  };

  const handleAddCourse = async (data: {
    code: string;
    name: string;
    category: string;
  }) => {
    try {
      const newCourse = await courseService.createCourse(data);
      toast.success("Course added successfully");
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course. Please try again.");
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      toast.error("Course not found");
      return;
    }

    const confirmMessage =
      course.enrolledCount > 0
        ? `This course has ${course.enrolledCount} enrolled student(s). Deleting it will remove all enrollments. Are you sure?`
        : "Are you sure you want to delete this course?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Update UI first
      setCourses((prevCourses) => prevCourses.filter((c) => c.id !== courseId));

      // Then sync with backend
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted successfully");
    } catch (error) {
      // Revert the state if backend call fails
      setCourses((prevCourses) => [...prevCourses, course]);
      console.error("Error deleting course:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete course. Please try again.");
      }
    }
  };

  const handleEnrollStudent = async (courseId: string, studentId: string) => {
    try {
      await courseService.enrollStudent(courseId, studentId);
      toast.success("Student enrolled successfully");
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast.error("Failed to enroll student");
    }
  };

  const handleAddSupervisorClick = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      toast.error("Course not found");
      return;
    }
    setSelectedCourseId(courseId);
    setIsAddSupervisorModalOpen(true);
  };

  const handleAddAssignmentClick = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      toast.error("Course not found");
      return;
    }
    setSelectedCourseId(courseId);
    setIsAddAssignmentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Course Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all courses, supervisors, and students
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddModalOpen(true)}
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
              Add Course
            </button>
            <Link
              to="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Add Course Modal */}
        <AddCourseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddCourse}
        />

        {error ? (
          <div className="mt-8 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-8 bg-white p-6 rounded-lg shadow text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No Courses Available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new course.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white overflow-hidden shadow-lg rounded-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {course.code}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {course.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {course.category}
                        </p>
                      </div>
                    </div>

                    {/* Supervisor List */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">
                        Supervisors
                      </h4>
                      <div className="mt-2 space-y-2">
                        {course.supervisors.length > 0 ? (
                          course.supervisors.map((supervisor) => (
                            <div
                              key={supervisor.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-900">
                                {supervisor.firstName} {supervisor.lastName}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveSupervisor(
                                    course.id,
                                    supervisor.id
                                  )
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No supervisors assigned
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Link
                          to={`/admin/courses/${course.id}/students`}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Manage Students
                        </Link>
                      </div>
                      <button
                        onClick={() => handleAddSupervisorClick(course.id)}
                        className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Add Supervisor
                      </button>
                      <button
                        onClick={() => handleAddAssignmentClick(course.id)}
                        className="inline-flex justify-center items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        Add Assignment
                      </button>
                      <div className="col-span-2">
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          <svg
                            className="h-5 w-5 mr-2"
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
                          Delete Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCourseId && (
          <>
            <AddSupervisorModal
              isOpen={isAddSupervisorModalOpen}
              onClose={() => {
                setIsAddSupervisorModalOpen(false);
                setSelectedCourseId(null);
              }}
              courseId={selectedCourseId}
              onSupervisorAdded={fetchCourses}
            />
            <AddAssignmentModal
              isOpen={isAddAssignmentModalOpen}
              onClose={() => {
                setIsAddAssignmentModalOpen(false);
                setSelectedCourseId(null);
              }}
              courseId={selectedCourseId}
              onAssignmentAdded={fetchCourses}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
