import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-32">
          <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Streamline Your Thesis Journey</span>
            <span className="block text-blue-600">at King's Own Institute</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            A comprehensive platform for managing undergraduate and postgraduate
            thesis submissions, designed to support KOI's academic excellence.
          </p>

          <div className="mt-16">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Streamlined Submission
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Submit and manage your thesis documents through our intuitive
                  digital platform.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Expert Supervision
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Receive guidance and feedback from KOI's experienced academic
                  supervisors.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">
                  Progress Tracking
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your thesis progress and stay updated with supervisor
                  feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} King's Own Institute. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
