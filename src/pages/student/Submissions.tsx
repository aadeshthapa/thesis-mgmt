import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.js";
import { toast } from "react-toastify";

interface Submission {
  id: string;
  title: string;
  status: string;
  submissionDate: string;
  grade?: string;
}

const Submissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/student/submissions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch submissions");

        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <li key={submission.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {submission.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted on:{" "}
                    {new Date(submission.submissionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      submission.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : submission.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {submission.status}
                  </span>
                  {submission.grade && (
                    <span className="ml-4 text-sm font-medium text-gray-600">
                      Grade: {submission.grade}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Submissions;
