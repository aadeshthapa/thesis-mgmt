import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onAssignmentAdded: () => void;
}

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onAssignmentAdded,
}) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAuthHeader, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an assignment title");
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = getAuthHeader();
      console.log("Making request with headers:", headers);
      console.log("Current user:", user);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses/${courseId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ title: title.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.message || "Failed to create assignment");
      }

      console.log("Assignment created:", data);
      toast.success("Assignment created successfully");
      onAssignmentAdded();
      setTitle("");
      onClose();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create assignment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Add Assignment
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
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Assignment Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Project Proposal"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssignmentModal;
