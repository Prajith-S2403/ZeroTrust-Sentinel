import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";  // ✅ Use TablePages.css instead
import "./Forensics.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Forensics() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (error) {
        console.error("Failed to fetch users", error);
        alert("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const generateReport = async () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(
        `/api/admin/forensics/${selectedUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data);
    } catch (error) {
      console.error("Failed to generate forensic report", error);
      alert("Failed to generate forensic report");
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "HIGH") return "threat-high";
    if (riskLevel === "MEDIUM") return "threat-medium";
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

  const exportToCSV = () => {
    if (!report || !report.timeline || report.timeline.length === 0) return;
    const headers = ["Action", "File", "Details", "Timestamp"];
    const rows = report.timeline.map(event => [
      event.action,
      event.file || "N/A",
      event.details || "—",
      new Date(event.timestamp).toLocaleString()
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const selectedUser = users.find(u => u._id === selectedUserId);
    a.download = `forensic_report_${selectedUser?.name || "user"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSelectedUserName = () => {
    const user = users.find(u => u._id === selectedUserId);
    return user ? user.name : "";
  };

  const getSelectedUserEmail = () => {
    const user = users.find(u => u._id === selectedUserId);
    return user ? user.email : "";
  };

  const downloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ZeroTrustX Digital Forensics Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Risk Level: ${report.riskLevel}`, 14, 35);
    doc.text(`Evidence Count: ${report.evidenceCount}`, 14, 45);
    doc.text(`Unauthorized Attempts: ${report.unauthorizedAttempts}`, 14, 55);
    doc.text(`Deleted Files: ${report.deletes}`, 14, 65);
    autoTable(doc, {
      startY: 80,
      head: [["Action", "File", "Details", "Timestamp"]],
      body: report.timeline.map((event) => [
        event.action,
        event.file,
        event.details,
        new Date(event.timestamp).toLocaleString(),
      ]),
    });
    doc.save("forensic-report.pdf");
  };

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">🔬 Digital Forensics</h2>
        <p className="page-subtitle">
          Deep forensic analysis and investigation of user activities
        </p>

        {/* Select User Card */}
        <div className="table-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label className="investigation-label">CHOOSE USER</label>
              <select
                className="investigation-select"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setReport(null);
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
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? "⏳ Generating..." : " Generate Report"}
            </button>
          </div>

          {selectedUserId && !report && !loading && (
            <div style={{
              marginTop: "1rem",
              padding: "0.75rem",
              background: "#0f1722",
              borderRadius: "8px",
              borderLeft: "3px solid #00f2fe"
            }}>
              <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Selected User:</span>
              <span style={{ color: "#00f2fe", fontWeight: "600", marginLeft: "0.5rem" }}>
                {getSelectedUserName()} ({getSelectedUserEmail()})
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Generating forensic report...</p>
          </div>
        )}

        {report && !loading && (
          <>
            {/* Stats Cards */}
            <div className="investigation-stats">
              <div className="stat-card">
                <h4>⚠️ Risk Level</h4>
                <p className={getRiskClass(report.riskLevel)}>
                  {report.riskLevel || "UNKNOWN"}
                </p>
              </div>
              <div className="stat-card">
                <h4>📊 Evidence Events</h4>
                <p>{report.evidenceCount || 0}</p>
              </div>
              <div className="stat-card">
                <h4>🚫 Unauthorized</h4>
                <p className={report.unauthorizedAttempts > 0 ? "threat-high" : "threat-low"}>
                  {report.unauthorizedAttempts || 0}
                </p>
              </div>
              <div className="stat-card">
                <h4>🗑️ Deleted Files</h4>
                <p>{report.deletes || 0}</p>
              </div>
            </div>

            {/* Forensic Timeline Table */}
            <div className="table-card">
              <div className="table-header">
                <h3>⏱️ Forensic Timeline</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="export-btn" onClick={exportToCSV}>
                    📥 Export CSV
                  </button>
                  <button className="export-btn" onClick={downloadPDF}>
                    📄 Export PDF
                  </button>
                </div>
              </div>

              {report.timeline && report.timeline.length > 0 ? (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>File</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.timeline.map((event, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`action-badge ${getActionClass(event.action)}`}>
                              {event.action || "Unknown"}
                            </span>
                          </td>
                          <td>{event.file || "N/A"}</td>
                          <td>{event.details || "—"}</td>
                          <td>{new Date(event.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No forensic evidence found for this user</div>
              )}
            </div>

            {/* Summary Card */}
            <div className="table-card" style={{ marginTop: "1.5rem" }}>
              <h3>🔍 Investigation Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Target User</label>
                  <span>{getSelectedUserName()}</span>
                </div>
                <div className="summary-item">
                  <label>Email</label>
                  <span>{getSelectedUserEmail()}</span>
                </div>
                <div className="summary-item">
                  <label>Risk Assessment</label>
                  <span className={getRiskClass(report.riskLevel)}>
                    {report.riskLevel || "UNKNOWN"} RISK
                  </span>
                </div>
                <div className="summary-item">
                  <label>Total Events</label>
                  <span>{report.timeline?.length || 0}</span>
                </div>
                <div className="summary-item">
                  <label>Investigation Date</label>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <label>Case ID</label>
                  <span>#FOR-{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            {report.riskLevel === "HIGH" && (
              <div className="recommendation-box high-risk">
                <div className="recommendation-icon">⚠️</div>
                <div className="recommendation-content">
                  <strong>Urgent Action Required</strong>
                  <p>This user shows high-risk behavior. Consider immediate account suspension, password reset, and security review.</p>
                </div>
              </div>
            )}
            {report.riskLevel === "MEDIUM" && (
              <div className="recommendation-box medium-risk">
                <div className="recommendation-icon">📌</div>
                <div className="recommendation-content">
                  <strong>Monitor Closely</strong>
                  <p>This user shows suspicious patterns. Enable enhanced monitoring and review access permissions.</p>
                </div>
              </div>
            )}
            {report.riskLevel === "LOW" && (
              <div className="recommendation-box low-risk">
                <div className="recommendation-icon">✅</div>
                <div className="recommendation-content">
                  <strong>Normal Activity</strong>
                  <p>No immediate concerns. Continue standard monitoring protocols.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Forensics;