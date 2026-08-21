import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import StudentDashboard from './pages/StudentDashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import MyGrievances from './pages/MyGrievances';
import GrievanceDetails from './pages/GrievanceDetails';
import StudentProfile from './pages/StudentProfile';

import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminGrievances from './pages/AdminGrievances';
import AdminGrievanceDetails from './pages/AdminGrievanceDetails';
import AdminStaff from './pages/AdminStaff';
import AdminProfile from './pages/AdminProfile';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/grievances/new"
            element={
              <PrivateRoute role="student">
                <SubmitGrievance />
              </PrivateRoute>
            }
          />
          <Route
            path="/grievances"
            element={
              <PrivateRoute role="student">
                <MyGrievances />
              </PrivateRoute>
            }
          />
          <Route
            path="/grievances/:id"
            element={
              <PrivateRoute>
                <GrievanceDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute role="student">
                <StudentProfile />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="grievances" element={<AdminGrievances />} />
            <Route path="grievances/:id" element={<AdminGrievanceDetails />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
