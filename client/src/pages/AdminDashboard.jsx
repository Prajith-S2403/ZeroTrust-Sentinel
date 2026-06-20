import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const statsRes = await API.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const logsRes = await API.get("/api/admin/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(statsRes.data);

        const logs = logsRes.data.logs || [];
        setRecentLogs(logs.slice(0, 5));

        const actions = [
          { action: "FILE_UPLOADED_ENCRYPTED", label: "UPLOADED" },
          { action: "FILE_DOWNLOADED", label: "DOWNLOAD" },
          { action: "FILE_SHARED", label: "SHARED" },
          { action: "FILE_DELETED", label: "DELETED" },
          { action: "UNAUTHORIZED_DOWNLOAD_ATTEMPT", label: "UNAUTH" },
        ];

        const data = actions.map((item) => ({
          action: item.label,
          fullAction: item.action,
          count: logs.filter((log) => log.action === item.action).length,
        }));

        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        alert("Failed to fetch dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  if (!stats) {
    return (
      <div className="admin-page">
        <Sidebar />
        <div className="dashboard-container">
          <h2 style={{ color: '#00f2fe', fontFamily: 'Inter, sans-serif' }}>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">ZeroTrustX Sentinel Dashboard</h1>

        <p className="dashboard-subtitle">
          Monitor users, encrypted files, logs, and unauthorized access attempts.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>

          <div className="stat-card">
            <h3>Total Files</h3>
            <p>{stats.totalFiles}</p>
          </div>

          <div className="stat-card">
            <h3>Encrypted Files</h3>
            <p>{stats.encryptedFiles}</p>
          </div>

          <div className="stat-card">
            <h3>Total Logs</h3>
            <p>{stats.totalLogs}</p>
          </div>

          <div className="stat-card">
            <h3>Unauthorized Attempts</h3>
            <p>{stats.unauthorizedAttempts}</p>
          </div>
        </div>

        <div className="chart-card">
          <h2>Activity Breakdown</h2>

          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="action" axisLine={false} tickLine={false} />

              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#00f2fe"
                radius={[12, 12, 0, 0]}
                barSize={65}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="security-summary">
          <h2>Security Summary</h2>

          <div className="security-grid">
            <div className="security-box">
              <h4>Threat Level</h4>
              <p className={stats.unauthorizedAttempts > 5 ? "danger" : "safe"}>
                {stats.unauthorizedAttempts > 5 ? "HIGH" : "LOW"}
              </p>
            </div>

            <div className="security-box">
              <h4>Encryption Status</h4>
              <p className="safe">ACTIVE</p>
            </div>

            <div className="security-box">
              <h4>Unauthorized Attempts</h4>
              <p className={stats.unauthorizedAttempts > 0 ? "danger" : "safe"}>
                {stats.unauthorizedAttempts}
              </p>
            </div>

            <div className="security-box">
              <h4>System Health</h4>
              <p className="safe">STABLE</p>
            </div>
          </div>
        </div>

        <div className="recent-activity-card">
          <h2>Recent Activity</h2>

          {recentLogs.length === 0 ? (
            <p className="no-activity">No recent activity found.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log._id} className="activity-item">
                <strong>{log.action}</strong>
                <p>{log.details}</p>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;