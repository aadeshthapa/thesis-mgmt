import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignment: {
    title: string;
    course: {
      name: string;
      code: string;
    };
  };
  student: {
    firstName: string;
    lastName: string;
  };
  fileUrl: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  grade?: number;
  feedback?: string;
  submissionDate: string;
}

const AssignmentReviews: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<AssignmentSubmission[]>(
    []
  );
  const [completedReviews, setCompletedReviews] = useState<
    AssignmentSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState<string>("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/assignments/reviews", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setPendingReviews(data.pending);
      setCompletedReviews(data.completed);
    } catch (error) {
      toast.error("Failed to load assignment reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const grade = parseFloat(gradeInput);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        toast.error("Please enter a valid grade between 0 and 100");
        return;
      }

      const response = await fetch(
        `/api/assignments/submissions/${selectedSubmission.id}/grade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            grade,
            feedback: feedbackInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit grade");
      }

      toast.success("Grade submitted successfully");
      setSelectedSubmission(null);
      setGradeInput("");
      setFeedbackInput("");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to submit grade");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Assignment Reviews</h1>

      {/* Pending Reviews Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pendingReviews.length === 0 ? (
            <p className="p-4 text-gray-500">No pending reviews</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingReviews.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.assignment.course.code}
                    </td>
                    <td className="px-6 py-4">{submission.assignment.title}</td>
                    <td className="px-6 py-4">{`${submission.student.firstName} ${submission.student.lastName}`}</td>
                    <td className="px-6 py-4">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Completed Reviews Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Completed Reviews</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {completedReviews.length === 0 ? (
            <p className="p-4 text-gray-500">No completed reviews</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedReviews.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.assignment.course.code}
                    </td>
                    <td className="px-6 py-4">{submission.assignment.title}</td>
                    <td className="px-6 py-4">{`${submission.student.firstName} ${submission.student.lastName}`}</td>
                    <td className="px-6 py-4">{submission.grade}</td>
                    <td className="px-6 py-4">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Grade Assignment
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Grade (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentReviews;
