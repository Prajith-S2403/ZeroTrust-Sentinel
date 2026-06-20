import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";

function Threats() {
  const [logs, setLogs] = useState([]);
  const [unauthorizedAttempts, setUnauthorizedAttempts] = useState(0);

  useEffect(() => {
    const fetchThreatData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allLogs = res.data.logs;

        const threatLogs = allLogs.filter(
          (log) =>
            log.action === "UNAUTHORIZED_DOWNLOAD_ATTEMPT" ||
            log.action === "FILE_DELETED"
        );

        const unauthorized = allLogs.filter(
          (log) => log.action === "UNAUTHORIZED_DOWNLOAD_ATTEMPT"
        ).length;

        setLogs(threatLogs);
        setUnauthorizedAttempts(unauthorized);
      } catch (error) {
        alert("Failed to fetch threat data");
      }
    };

    fetchThreatData();
  }, []);

  const threatLevel = unauthorizedAttempts > 5 ? "HIGH" : "LOW";

  // Get action badge class
  const getActionClass = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("unauthorized")) return "unauthorized";
    if (actionLower.includes("delete")) return "delete";
    if (actionLower.includes("upload")) return "upload";
    if (actionLower.includes("download")) return "download";
    if (actionLower.includes("share")) return "share";
    return "";
  };

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">⚠️ Threat Monitoring</h2>

        <div className="threat-grid">
          <div className="threat-card">
            <h3>Threat Level</h3>
            <p className={threatLevel === "HIGH" ? "threat-high" : "threat-low"}>
              {threatLevel}
            </p>
          </div>

          <div className="threat-card">
            <h3>Unauthorized Attempts</h3>
            <p>{unauthorizedAttempts}</p>
          </div>

          <div className="threat-card">
            <h3>Security Events</h3>
            <p>{logs.length}</p>
          </div>
        </div>

        <div className="table-card">
          <h3>Recent Threat Events</h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No threat events found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td className="user-cell">{log.user?.name || "Unknown"}</td>
                      <td className="email-cell">{log.user?.email || "Unknown"}</td>
                      <td>
                        <span className={`action-badge ${getActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="details-cell">{log.details}</td>
                      <td className="time-cell">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Threats;