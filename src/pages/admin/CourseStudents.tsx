import React from "react";
import { useParams, Link } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { toast } from "react-toastify";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

const CourseStudents: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [enrolledStudents, setEnrolledStudents] = React.useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Student[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!courseId) return;
      try {
        console.log("Fetching enrolled students for course:", courseId);
        const data = await courseService.getCourseStudents(courseId);
        console.log("Enrolled students data:", data);
        setEnrolledStudents(data);
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
        toast.error(
          "Failed to load enrolled students. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [courseId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Set a new timeout for debouncing
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        console.log("Searching students with query:", query);
        const results = await courseService.searchStudents(query);
        console.log("Raw search results:", results);

        // Always set search results, even if empty
        const filteredResults = results.filter(
          (student) =>
            !enrolledStudents.some((enrolled) => enrolled.id === student.id)
        );
        console.log("Filtered results:", filteredResults);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching students:", error);
        toast.error("Failed to search students. Please try again.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay
  };

  // Cleanup timeout on component unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleEnrollStudent = async (studentId: string) => {
    if (!courseId) return;
    try {
      await courseService.enrollStudent(courseId, studentId);
      // Refresh enrolled students list
      const updatedStudents = await courseService.getCourseStudents(courseId);
      setEnrolledStudents(updatedStudents);
      // Remove enrolled student from search results
      setSearchResults(
        searchResults.filter((student) => student.id !== studentId)
      );
      toast.success("Student enrolled successfully");
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast.error("Failed to enroll student. Please try again.");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!courseId) return;
    try {
      await courseService.removeStudent(courseId, studentId);
      setEnrolledStudents(
        enrolledStudents.filter((student) => student.id !== studentId)
      );
      toast.success("Student removed successfully");
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Course Students
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add or remove students from this course
            </p>
          </div>
          <Link
            to="/admin/courses"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Courses
          </Link>
        </div>

        {/* Search Section */}
        <div className="mt-8">
          <div className="max-w-xl">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search Students
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Type at least 2 characters to search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
            {searchQuery.length === 1 && (
              <p className="mt-1 text-sm text-gray-500">
                Type one more character to start searching...
              </p>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mt-4">
              {isSearching ? (
                <p className="text-gray-500">Searching for students...</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.studentId}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Add to Course
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 &&
                    searchQuery.length >= 2 &&
                    !isSearching && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          No matching students found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enrolled Students List */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">
            Enrolled Students ({enrolledStudents.length})
          </h2>
          <div className="mt-4 space-y-2">
            {enrolledStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
              >
                <div>
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{student.studentId}</p>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            {enrolledStudents.length === 0 && (
              <p className="text-gray-500">
                No students enrolled in this course
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStudents;
