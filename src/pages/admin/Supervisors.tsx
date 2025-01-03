import React from "react";
import { User, SupervisorProfile } from "@prisma/client";
import { adminService } from "../../services/adminService";

interface UserWithProfile extends User {
  supervisorProfile: SupervisorProfile | null;
}

const Supervisors: React.FC = () => {
  const [supervisors, setSupervisors] = React.useState<UserWithProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const supervisorsList = await adminService.getAllSupervisors();
        setSupervisors(supervisorsList as UserWithProfile[]);
      } catch (error) {
        console.error("Error fetching supervisors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            All Supervisors
          </h1>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supervisors.map((supervisor) => (
                  <tr key={supervisor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supervisor.firstName} {supervisor.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supervisor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supervisor.supervisorProfile?.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supervisor.supervisorProfile?.specialization}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Supervisors;
