import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";

function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/logs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogs(res.data.logs);
      } catch (error) {
        alert("Failed to fetch logs");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">Activity Logs</h2>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Action</th>
                <th>File</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.user?.name || "Unknown"}</td>
                  <td>{log.user?.email || "Unknown"}</td>
                  <td>{log.action}</td>
                  <td>{log.fileId?.originalname || "N/A"}</td>
                  <td>{log.details}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Logs;