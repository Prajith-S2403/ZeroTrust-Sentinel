import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";
import "./UserInvestigation.css";

function UserInvestigation() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data.users || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
        alert("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const fetchUserActivity = async () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await API.get(
        `/api/admin/user-activity/${selectedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivity(res.data);
    } catch (error) {
      console.error("Failed to fetch user activity", error);
      alert("Failed to fetch user activity");
    } finally {
      setLoading(false);
    }
  };

  const getThreatClass = (score) => {
    if (score > 50) return "threat-high";
    if (score > 25) return "threat-medium";
    return "threat-low";
  };

  const getActionClass = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("upload")) return "upload";
    if (actionLower.includes("download")) return "download";
    if (actionLower.includes("share")) return "share";
    if (actionLower.includes("delete")) return "delete";
    if (actionLower.includes("unauthorized")) return "unauthorized";
    return "";
  };

  const getThreatColor = (score) => {
    if (score > 50) return "#f87171";
    if (score > 25) return "#fbbf24";
    return "#34d399";
  };

  const getSelectedUserName = () => {
    const user = users.find(u => u._id === selectedUserId);
    return user ? user.name : "";
  };

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">🔍 User Investigation</h2>
        <p className="page-subtitle">
          Deep dive into user activity, behavior analysis, and threat assessment
        </p>

        {/* Select User Card */}
        <div className="table-card" style={{ marginBottom: "2rem" }}>
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            alignItems: "flex-end", 
            flexWrap: "wrap" 
          }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label className="investigation-label">CHOOSE USER</label>
              <select
                className="investigation-select"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setActivity(null);
                }}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="investigate-btn"
              onClick={fetchUserActivity}
              disabled={loading}
            >
              {loading ? "⏳ Loading..." : " Investigate"}
            </button>
          </div>

          {selectedUserId && !activity && !loading && (
            <div style={{ 
              marginTop: "1rem", 
              padding: "0.75rem", 
              background: "#0f1722", 
              borderRadius: "8px",
              borderLeft: "3px solid #00f2fe"
            }}>
              <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Selected User:</span>
              <span style={{ color: "#00f2fe", fontWeight: "600", marginLeft: "0.5rem" }}>
                {getSelectedUserName()}
              </span>
            </div>
          )}
        </div>

        {/* Activity Results */}
        {activity && !loading && (
          <>
            {/* Stats Cards */}
            <div className="investigation-stats">
              <div className="stat-card">
                <h4>📤 Uploads</h4>
                <p>{activity.summary?.uploads || 0}</p>
              </div>

              <div className="stat-card">
                <h4>📥 Downloads</h4>
                <p>{activity.summary?.downloads || 0}</p>
              </div>

              <div className="stat-card">
                <h4>🔄 Shares</h4>
                <p>{activity.summary?.shares || 0}</p>
              </div>

              <div className="stat-card">
                <h4>⚠️ Threat Score</h4>
                <p style={{ color: getThreatColor(activity.summary?.threatScore || 0) }}>
                  {activity.summary?.threatScore || 0}
                </p>
              </div>
            </div>

            {/* User Summary */}
            <div className="table-card" style={{ marginBottom: "1.5rem" }}>
              <h3>👤 User Summary</h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "1rem" 
              }}>
                <div>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Name</span>
                  <p style={{ color: "#f3f4f6", fontWeight: "500", margin: "0.25rem 0 0" }}>
                    {activity.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Email</span>
                  <p style={{ color: "#f3f4f6", fontWeight: "500", margin: "0.25rem 0 0" }}>
                    {activity.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Risk Level</span>
                  <p style={{ 
                    color: getThreatColor(activity.summary?.threatScore || 0),
                    fontWeight: "700",
                    margin: "0.25rem 0 0"
                  }}>
                    {activity.summary?.threatScore > 50 ? "HIGH" : 
                     activity.summary?.threatScore > 25 ? "MEDIUM" : "LOW"}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Total Events</span>
                  <p style={{ color: "#f3f4f6", fontWeight: "500", margin: "0.25rem 0 0" }}>
                    {activity.logs?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Table */}
            <div className="table-card">
              <h3>📋 Recent User Actions</h3>

              {activity.logs && activity.logs.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>File</th>
                        <th>Details</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.logs.map((log, index) => (
                        <tr key={log._id || index}>
                          <td>
                            <span className={`action-badge ${getActionClass(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>{log.fileId?.originalname || "N/A"}</td>
                          <td>{log.details || "—"}</td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No activity found for this user</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserInvestigation;