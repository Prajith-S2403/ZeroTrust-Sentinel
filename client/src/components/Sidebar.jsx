// In Sidebar.jsx - Add Settings link
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ZeroTrustX</h2>
        <p>Admin Panel</p>
      </div>

      <div className="sidebar-menu">
        <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard')}`}>
          <span>Dashboard</span>
        </Link>

        <Link to="/admin/users" className={`sidebar-link ${isActive('/admin/users')}`}>
          <span>👥</span>
          <span>Users</span>
        </Link>

        <Link to="/admin/investigation" className={`sidebar-link ${isActive('/admin/investigation')}`}>
          <span>🔍</span>
          <span>Investigation</span>
        </Link>

        <Link to="/admin/threats" className={`sidebar-link ${isActive('/admin/threats')}`}>
          <span>⚠️</span>
          <span>Threats</span>
        </Link>

        <Link to="/admin/forensics" className={`sidebar-link ${isActive('/admin/forensics')}`}>
          <span>🔬</span>
          <span>Forensics</span>
        </Link>

        <Link to="/admin/files" className={`sidebar-link ${isActive('/admin/files')}`}>
          <span>📁</span>
          <span>Files</span>
        </Link>

        <Link to="/admin/logs" className={`sidebar-link ${isActive('/admin/logs')}`}>
          <span>📋</span>
          <span>Logs</span>
        </Link>
        <Link
          to="/admin/ai-detection"
          className={`sidebar-link ${isActive('/admin/ai-detection')}`}
        >
          <span>🤖</span>
          <span>AI Detection</span>
        </Link>
        <Link to="/admin/blockchain" className={`sidebar-link ${isActive('/admin/blockchain')}`}>
          <span>🔗</span>
          <span>Blockchain</span>
        </Link>
      </div>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button 
          className="sidebar-link logout-btn" 
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/");
          }}
          style={{ 
            width: '100%', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#ef4444', 
            background: 'rgba(239, 68, 68, 0.05)',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;