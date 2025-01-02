import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.js";
import { toast } from "react-toastify";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile data from the server
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setFormData({
          name: data.name || user?.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          department: data.department || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to context user data if API fails
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          department: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <p className="text-gray-600">{formData.name}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <p className="text-gray-600">{formData.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Phone
              </label>
              <p className="text-gray-600">{formData.phone || "Not set"}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Department
              </label>
              <p className="text-gray-600">
                {formData.department || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Role</label>
              <p className="text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
