import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

interface ProfileData {
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  program: string;
  enrollmentYear: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    studentId: user?.studentProfile?.studentId || "",
    department: user?.studentProfile?.department || "",
    program: user?.studentProfile?.program || "",
    enrollmentYear:
      user?.studentProfile?.enrollmentYear || new Date().getFullYear(),
  });

  // Update form data when user context changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        studentId: user.studentProfile?.studentId || "",
        department: user.studentProfile?.department || "",
        program: user.studentProfile?.program || "",
        enrollmentYear:
          user.studentProfile?.enrollmentYear || new Date().getFullYear(),
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <p className="text-gray-900">{formData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <p className="text-gray-900">{formData.lastName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{formData.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <p className="text-gray-900">{formData.studentId || "Not set"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <p className="text-gray-900">{formData.department || "Not set"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <p className="text-gray-900">{formData.program || "Not set"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Year
            </label>
            <p className="text-gray-900">
              {formData.enrollmentYear || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
