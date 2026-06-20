import { useEffect, useState } from "react";
import API from "../api";
import UserNavbar from "../components/UserNavbar";
import "./UserPages.css";

function UserActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    uploads: 0,
    downloads: 0,
    shares: 0,
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/files/logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const logsData = res.data.logs || [];
        setLogs(logsData);

        setStats({
          total: logsData.length,
          uploads: logsData.filter(log => log.action?.toLowerCase().includes('upload')).length,
          downloads: logsData.filter(log => log.action?.toLowerCase().includes('download')).length,
          shares: logsData.filter(log => log.action?.toLowerCase().includes('share')).length,
        });
      } catch (error) {
        console.error("Failed to fetch activity logs", error);
        alert("Failed to fetch activity logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionBadge = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("upload")) return "action-upload";
    if (actionLower.includes("download")) return "action-download";
    if (actionLower.includes("share")) return "action-share";
    if (actionLower.includes("delete")) return "action-delete";
    if (actionLower.includes("unauthorized")) return "action-unauthorized";
    return "";
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("upload")) return "📤";
    if (actionLower.includes("download")) return "📥";
    if (actionLower.includes("share")) return "📤";
    if (actionLower.includes("delete")) return "🗑️";
    if (actionLower.includes("unauthorized")) return "⚠️";
    return "📋";
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fileId?.originalname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === "all" || 
      log.action?.toLowerCase().includes(filterAction.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action).filter(Boolean))];

  return (
    <div>
      <UserNavbar />

      <div className="user-container">
        <div className="user-page-header">
          <div>
            <h1>My Activity</h1>
            <p className="user-subtitle">
              Track all your file activities and system actions
            </p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="user-card-grid">
          <div className="user-card">
            <h3>📊 Total Activities</h3>
            <p>{stats.total}</p>
          </div>
          <div className="user-card">
            <h3>📤 Uploads</h3>
            <p>{stats.uploads}</p>
          </div>
          <div className="user-card">
            <h3>📥 Downloads</h3>
            <p>{stats.downloads}</p>
          </div>
          <div className="user-card">
            <h3>📤 Shares</h3>
            <p>{stats.shares}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="user-controls">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search by action, file, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="controls-actions">
            <select 
              className="filter-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="user-table-card">
          <div className="user-table-header">
            <h3 className="activity-icon">Activity Log</h3>
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {filteredLogs.length} entries
            </span>
          </div>

          {loading ? (
            <div className="user-loading">
              <div className="user-loading-spinner"></div>
              <p>Loading your activity...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="user-empty-state">
              <p>No activity found</p>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Your file activities will appear here
              </span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="user-data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>File</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <span className={`action-badge ${getActionBadge(log.action)}`}>
                          {getActionIcon(log.action)} {log.action || "Unknown"}
                        </span>
                      </td>
                      <td>
                        {log.fileId?.originalname ? (
                          <div className="file-info">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{log.fileId.originalname}</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{log.details || "—"}</td>
                      <td>
                        <span className="activity-time" title={new Date(log.timestamp).toLocaleString()}>
                          {getTimeAgo(log.timestamp)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Summary Footer */}
        {logs.length > 0 && (
          <div className="activity-footer">
            <div className="footer-info">
              <span className="footer-icon">📊</span>
              <div className="footer-text">
                <strong>Activity Summary</strong>
                <p>Last activity: {getTimeAgo(logs[0]?.timestamp)}</p>
              </div>
            </div>
            <div className="footer-info">
              <span className="footer-icon">🔒</span>
              <div className="footer-text">
                <strong>Secure Logging</strong>
                <p>All activities are encrypted and tamper-proof</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserActivity;