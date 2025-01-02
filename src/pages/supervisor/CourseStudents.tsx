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

  React.useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!courseId) return;
      try {
        const data = await courseService.getCourseStudents(courseId);
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
    if (query.length >= 2) {
      setIsSearching(true);
      try {
        const results = await courseService.searchStudents(query);
        // Filter out already enrolled students
        const filteredResults = results.filter(
          (student) =>
            !enrolledStudents.some((enrolled) => enrolled.id === student.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching students:", error);
        toast.error("Failed to search students. Please try again.");
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">
            Course Students
          </h1>
          <Link
            to="/supervisor/courses"
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
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mt-4">
              {isSearching ? (
                <p className="text-gray-500">Searching...</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
                    >
                      <div>
                        <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
                        <p className="text-sm text-gray-500">
                          {student.studentId}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add to Course
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <p className="text-gray-500">No matching students found</p>
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
                  <p className="font-medium">{`${student.firstName} ${student.lastName}`}</p>
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
