import React from "react";
import SupervisorSidebar from "./SupervisorSidebar";

interface SupervisorLayoutProps {
  children: React.ReactNode;
}

const SupervisorLayout: React.FC<SupervisorLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SupervisorSidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
};

export default SupervisorLayout;
