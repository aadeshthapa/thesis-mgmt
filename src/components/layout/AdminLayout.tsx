import React from "react";
import Sidebar from "./Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <main className="py-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
