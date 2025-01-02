import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { courseService } from "../../services/courseService";

interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface CoursesByCategory {
  [category: string]: Course[];
}

export const CourseList: React.FC = () => {
  const { user } = useAuth();
  const [coursesByCategory, setCoursesByCategory] = useState<CoursesByCategory>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (user?.id) {
          const courses = await courseService.getEnrolledCourses(user.id);
          setCoursesByCategory(courses);
        }
      } catch (err) {
        setError("Failed to fetch enrolled courses");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id]);

  if (loading) {
    return <div className="text-center py-4">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (Object.keys(coursesByCategory).length === 0) {
    return <div className="text-center py-4">No courses enrolled</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(coursesByCategory).map(([category, courses]) => (
        <div key={category} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-medium text-indigo-600">{course.code}</h3>
                <p className="text-gray-600 mt-1">{course.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
