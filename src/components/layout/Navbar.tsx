import React from "react";
import { Link } from "react-router-dom";
import koiLogo from "../../assets/koi.jpg";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/">
              <img src={koiLogo} alt="KOI Logo" className="h-12 w-auto" />
            </a>

            <span className="ml-4 text-xl font-semibold text-gray-900">
              Thesis Management System
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
            <Link
              to="/login"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
