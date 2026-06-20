import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./UserPages.css";
import UserNavbar from "../components/UserNavbar";

function UserDashboard() {
  const navigate = useNavigate();
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const myRes = await API.get("/api/files/my-files", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sharedRes = await API.get(
          "/api/files/shared-with-me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMyFiles(myRes.data.files || []);
        setSharedFiles(sharedRes.data.files || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        alert("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Download Function
  const downloadFile = async (id, name) => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/api/files/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download file");
    }
  };

  // ✅ Share Function
  const shareFile = async (fileId) => {
    const email = prompt("Enter user email to share with:");
    if (!email) return;

    const permission = prompt("Enter permission: view or download", "download");
    if (!permission || !["view", "download"].includes(permission.toLowerCase())) {
      alert("Invalid permission. Please enter 'view' or 'download'");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.post(
        `/api/files/share/${fileId}`,
        {
          email,
          permission: permission.toLowerCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`✅ File shared successfully with ${email} (${permission} permission)`);
    } catch (error) {
      console.error("Share failed", error);
      alert(error.response?.data?.message || "File sharing failed");
    }
  };

  // ✅ Delete Function
  const deleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMyFiles(myFiles.filter(file => file._id !== id));
      alert("File deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete file");
    }
  };

  if (loading) {
    return (
      <div>
        <UserNavbar />
        <div className="user-container">
          <div className="user-loading">
            <div className="user-loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="user-container">
        <h1>User Dashboard</h1>
        <p className="user-subtitle">
          Manage your files and view shared documents
        </p>

        <div className="user-card-grid">
          <div className="user-card">
            <h3>My Files</h3>
            <p>{myFiles.length}</p>
          </div>

          <div className="user-card">
            <h3>Shared With Me</h3>
            <p>{sharedFiles.length}</p>
          </div>

          <div className="user-card">
            <h3>Total Files</h3>
            <p>{myFiles.length + sharedFiles.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="quick-action-btn upload"
            onClick={() => navigate("/upload")}
          >
            📤 Upload File
          </button>
          <button 
            className="quick-action-btn share"
            onClick={() => navigate("/my-files")}
          >
            👥 Share File
          </button>
        </div>

        {/* My Files Table */}
        {myFiles.length > 0 && (
          <div className="user-table-card">
            <div className="user-table-header">
              <h3 className="files-icon">My Files</h3>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {myFiles.length} files
              </span>
            </div>

            <table className="user-data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myFiles.map((file) => (
                  <tr key={file._id}>
                    <td>{file.originalname}</td>
                    <td>{(file.size / 1024).toFixed(1)} KB</td>
                    <td>
                      <span className={`file-status ${file.isEncrypted ? 'encrypted' : 'pending'}`}>
                        {file.isEncrypted ? '🔒 Encrypted' : '📄 Pending'}
                      </span>
                    </td>
                    <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="file-actions">
                        <button 
                          className="file-btn download"
                          onClick={() => downloadFile(file._id, file.originalname)}
                          title="Download"
                        >
                          ⬇ Download
                        </button>
                        <button 
                          className="file-btn share"
                          onClick={() => shareFile(file._id)}
                          title="Share"
                        >
                          📤 Share
                        </button>
                        <button 
                          className="file-btn delete"
                          onClick={() => deleteFile(file._id)}
                          title="Delete"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Shared Files Table */}
        {sharedFiles.length > 0 && (
          <div className="user-table-card">
            <div className="user-table-header">
              <h3 className="shared-icon">Shared With Me</h3>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {sharedFiles.length} files
              </span>
            </div>

            <table className="user-data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Owner</th>
                  <th>Size</th>
                  <th>Shared</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sharedFiles.map((file) => (
                  <tr key={file._id}>
                    <td>{file.originalname}</td>
                    <td>{file.owner?.email || "Unknown"}</td>
                    <td>{(file.size / 1024).toFixed(1)} KB</td>
                    <td>{new Date(file.sharedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="file-actions">
                        <button 
                          className="file-btn download"
                          onClick={() => downloadFile(file._id, file.originalname)}
                          title="Download"
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {myFiles.length === 0 && sharedFiles.length === 0 && (
          <div className="user-empty-state">
            <p>No files found. Upload your first file to get started!</p>
            <button 
              className="quick-action-btn upload"
              onClick={() => navigate("/upload")}
              style={{ marginTop: "1rem", display: "inline-flex" }}
            >
              📤 Upload Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard;