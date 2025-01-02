import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { CourseList } from "../../components/features/student/CourseList";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">Here are your enrolled courses:</p>
      </div>

      <CourseList />
    </div>
  );
};
