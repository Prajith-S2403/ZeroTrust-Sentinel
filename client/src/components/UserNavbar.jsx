// components/UserNavbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./UserNavbar.css";

function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const goToProfile = () => {
    navigate("/profile");
    closeMobileMenu();
  };

  return (
    <nav className="user-navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard" onClick={closeMobileMenu}>
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">ZeroTrustX</span>
            <span className="logo-badge">User</span>
          </Link>
        </div>

        {/* ✅ Clickable User Info - Goes to Profile */}
        <div className="navbar-user-info" onClick={goToProfile}>
          <span className="user-avatar">{getInitials()}</span>
          <span className="user-name">{user?.name || "User"}</span>
          <span className="user-profile-hint">👤</span>
        </div>

        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/dashboard" 
            className={isActive('/dashboard') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>

          <Link 
            to="/my-files" 
            className={isActive('/my-files') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📁</span>
            My Files
          </Link>

          <Link 
            to="/shared-with-me" 
            className={isActive('/shared-with-me') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">👥</span>
            Shared With Me
          </Link>

          <Link 
            to="/activity" 
            className={isActive('/activity') ? 'active' : ''}
            onClick={closeMobileMenu}
          >
            <span className="nav-icon">📋</span>
            My Activity
          </Link>

          {/* ❌ Profile Link REMOVED from menu */}

          <div className="nav-divider"></div>

          {/* Mobile User Info - Clickable */}
          <div className="mobile-user-info" onClick={goToProfile}>
            <span className="mobile-avatar">{getInitials()}</span>
            <span className="mobile-name">{user?.name || "User"}</span>
            <span className="mobile-email">{user?.email || ""}</span>
            <span className="mobile-profile-link">👤 View Profile</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;