// App.jsx - Settings removed
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import UserInvestigation from './pages/UserInvestigation';
import Threats from './pages/Threats';
import Forensics from './pages/Forensics';
import Files from './pages/Files';
import Logs from './pages/Logs';
import Blockchain from './pages/Blockchain';
import MLThreats from './pages/MLThreats';

// User Pages
import UserDashboard from './pages/UserDashboard';
import MyFiles from './pages/MyFiles';
import SharedWithMe from './pages/SharedWithMe';
import UploadFile from './pages/UploadFile';
import UserActivity from './pages/UserActivity';
import Profile from './pages/Profile';

// ❌ Settings import REMOVED

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/investigation" element={<UserInvestigation />} />
        <Route path="/admin/threats" element={<Threats />} />
        <Route path="/admin/forensics" element={<Forensics />} />
        <Route path="/admin/files" element={<Files />} />
        <Route path="/admin/logs" element={<Logs />} />
        <Route path="/admin/blockchain" element={<Blockchain />} />
        <Route path="/admin/ai-detection" element={<MLThreats />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-files" element={<MyFiles />} />
        <Route path="/shared-with-me" element={<SharedWithMe />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/activity" element={<UserActivity />} />
        <Route path="/profile" element={<Profile />} />
        {/* ❌ Settings route REMOVED */}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;