import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [coursesByCategory, setCoursesByCategory] = useState<CoursesByCategory>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (user?.id) {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/courses/enrolled`,
            {
              headers: {
                ...getAuthHeader(),
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch courses");
          }

          const courses: Course[] = await response.json();
          console.log("Fetched courses:", courses);

          // Group courses by category
          const grouped = courses.reduce(
            (acc: CoursesByCategory, course: Course) => {
              const category = course.category || "Uncategorized";
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(course);
              return acc;
            },
            {} as CoursesByCategory
          );

          console.log("Grouped courses:", grouped);
          setCoursesByCategory(grouped);
        }
      } catch (err) {
        setError("Failed to fetch enrolled courses");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id, getAuthHeader]);

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
                onClick={() =>
                  navigate(`/student/courses/${course.id}/assignments`)
                }
                className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors cursor-pointer"
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
