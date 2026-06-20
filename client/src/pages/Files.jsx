import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./AdminDashboard.css";

function Files() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFiles(res.data.files);
      } catch (error) {
        alert("Failed to fetch files");
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">All Files</h2>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Original Name</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Encrypted</th>
                <th>Size</th>
                <th>Uploaded At</th>
              </tr>
            </thead>

            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td>{file.originalname}</td>
                  <td>{file.owner?.name || "Unknown"}</td>
                  <td>{file.owner?.email || "Unknown"}</td>
                  <td>{file.isEncrypted ? "Yes" : "No"}</td>
                  <td>{file.size} bytes</td>
                  <td>{new Date(file.uploadedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Files;