import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import pages
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import About from "./pages/About.js";
import ThesisSubmission from "./pages/student/ThesisSubmission.js";
import SupervisorDashboard from "./pages/supervisor/Dashboard.js";
import CoursesList from "./pages/supervisor/CoursesList.js";
import CourseStudents from "./pages/supervisor/CourseStudents.js";
import AdminDashboard from "./pages/admin/Dashboard.js";
import AdminCoursesList from "./pages/admin/CoursesList.js";
import AdminCourseStudents from "./pages/admin/CourseStudents.js";
import Students from "./pages/admin/Students.js";
import Supervisors from "./pages/admin/Supervisors.js";
import StudentLayout from "./components/layout/StudentLayout.js";
import Register from "./pages/Register.js";
import ForgotPassword from "./pages/ForgotPassword.js";
import ResetPassword from "./pages/ResetPassword.js";
import Profile from "./pages/student/Profile.js";
import Submissions from "./pages/student/Submissions.js";
import { StudentDashboard } from "./pages/student/Dashboard.js";
import CourseAssignments from "./pages/student/CourseAssignments.js";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Student Routes */}
            <Route path="/student/*" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="submit" element={<ThesisSubmission />} />
              <Route path="submissions" element={<Submissions />} />
              <Route
                path="courses/:courseId/assignments"
                element={<CourseAssignments />}
              />
            </Route>

            {/* Supervisor Routes */}
            <Route
              path="/supervisor/dashboard"
              element={<SupervisorDashboard />}
            />
            <Route path="/supervisor/courses" element={<CoursesList />} />
            <Route
              path="/supervisor/courses/:courseId/students"
              element={<CourseStudents />}
            />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCoursesList />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/supervisors" element={<Supervisors />} />
            <Route
              path="/admin/courses/:courseId/students"
              element={<AdminCourseStudents />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
