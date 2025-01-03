import React from "react";
import { courseService } from "../services/courseService";
import { toast } from "react-toastify";

interface AddSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onSupervisorAdded: () => void;
}

const AddSupervisorModal: React.FC<AddSupervisorModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onSupervisorAdded,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    Array<{
      id: string;
      firstName: string;
      lastName: string;
      department: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

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
        const results = await courseService.searchSupervisors(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching supervisors:", error);
        toast.error("Failed to search supervisors. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleAssignSupervisor = async (supervisorId: string) => {
    try {
      await courseService.assignSupervisor(courseId, supervisorId);
      toast.success("Supervisor assigned successfully");
      onSupervisorAdded();
      onClose();
    } catch (error) {
      console.error("Error assigning supervisor:", error);
      toast.error("Failed to assign supervisor. Please try again.");
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[480px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Add Supervisor to Course
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

        <div className="mt-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Search Supervisors
          </label>
          <input
            type="text"
            id="search"
            className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Type at least 2 characters to search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((supervisor) => (
                <div
                  key={supervisor.id}
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div>
                    <p className="font-medium">
                      {supervisor.firstName} {supervisor.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supervisor.department}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssignSupervisor(supervisor.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No matching supervisors found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSupervisorModal;
