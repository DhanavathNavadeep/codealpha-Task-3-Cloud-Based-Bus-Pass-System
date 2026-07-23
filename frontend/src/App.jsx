import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ApplyPass from './pages/ApplyPass';
import MyPasses from './pages/MyPasses';
import Profile from './pages/Profile';

import AdminDashboard from './pages/AdminDashboard';
import AdminPasses from './pages/AdminPasses';
import AdminRoutes from './pages/AdminRoutes';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="main-content">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Protected Routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><AppLayout><ApplyPass /></AppLayout></ProtectedRoute>} />
            <Route path="/my-passes" element={<ProtectedRoute><AppLayout><MyPasses /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/passes" element={<ProtectedRoute adminOnly={true}><AppLayout><AdminPasses /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/routes" element={<ProtectedRoute adminOnly={true}><AppLayout><AdminRoutes /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly={true}><AppLayout><AdminReports /></AppLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
