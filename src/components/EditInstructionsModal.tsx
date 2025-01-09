import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

interface EditInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  assignmentId: string;
  currentInstructions: string;
  onInstructionsUpdated: () => void;
}

const EditInstructionsModal: React.FC<EditInstructionsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  assignmentId,
  currentInstructions,
  onInstructionsUpdated,
}) => {
  const [instructions, setInstructions] = useState(currentInstructions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    setInstructions(currentInstructions);
  }, [currentInstructions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/courses/${courseId}/assignments/${assignmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            instructions: instructions.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update instructions");
      }

      toast.success("Instructions updated successfully");
      onInstructionsUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating instructions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update instructions"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit Assignment Instructions
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
              htmlFor="instructions"
              className="block text-sm font-medium text-gray-700"
            >
              Instructions
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter assignment instructions..."
              rows={8}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInstructionsModal;
