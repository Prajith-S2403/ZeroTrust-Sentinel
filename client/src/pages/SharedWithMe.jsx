import { useEffect, useState } from "react";
import API from "../api";
import "./UserPages.css";
import UserNavbar from "../components/UserNavbar";
function SharedWithMe() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOwner, setFilterOwner] = useState("all");

  useEffect(() => {
    const fetchSharedFiles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/files/shared-with-me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFiles(res.data.files || []);
      } catch (error) {
        console.error("Failed to fetch shared files", error);
        alert("Failed to fetch shared files");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFiles();
  }, []);

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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📽️';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    if (['mp4', 'avi', 'mkv'].includes(ext)) return '🎬';
    if (['mp3', 'wav'].includes(ext)) return '🎵';
    return '📎';
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

  // Get unique owners for filter
  const owners = [...new Set(files.map(file => file.owner?.email).filter(Boolean))];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOwner = filterOwner === "all" || file.owner?.email === filterOwner;
    
    return matchesSearch && matchesOwner;
  });



  return (
    <>
    <UserNavbar />
    <div className="user-container">
      <div className="user-page-header">
        <div>
          <h1>Shared With Me</h1>
          <p className="user-subtitle">
            Files and documents shared with you by other users
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
          <h3>Total Shared</h3>
          <p>{files.length}</p>
        </div>
        <div className="user-card">
          <h3>Shared By</h3>
          <p>{owners.length}</p>
        </div>
        <div className="user-card">
          <h3>Total Size</h3>
          <p>{formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="user-controls">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by file name or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="controls-actions">
          <select 
            className="filter-select"
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            <option value="all">All Owners</option>
            {owners.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shared Files Table */}
      <div className="user-table-card">
        <div className="user-table-header">
          <h3 className="shared-icon">Shared Files</h3>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            {filteredFiles.length} files
          </span>
        </div>

        {loading ? (
          <div className="user-loading">
            <div className="user-loading-spinner"></div>
            <p>Loading shared files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="user-empty-state">
            <p>No files shared with you yet</p>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Files shared with you will appear here
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="user-data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Owner</th>
                  <th>Shared</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file._id}>
                    <td>
                      <div className="file-info">
                        <span className="file-icon">{getFileIcon(file.originalname)}</span>
                        <span className="file-name">{file.originalname}</span>
                      </div>
                    </td>
                    <td>
                      <div className="owner-info">
                        <span className="owner-name">{file.owner?.name || "Unknown"}</span>
                        <span className="owner-email">{file.owner?.email || "Unknown"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="shared-time">
                        {getTimeAgo(file.sharedAt || file.createdAt)}
                      </span>
                    </td>
                    <td>{formatFileSize(file.size)}</td>
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
                          className="file-btn view" 
                          onClick={() => window.open(`/file/${file._id}`, '_blank')}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity Footer */}
      {files.length > 0 && (
        <div className="shared-footer">
          <div className="footer-info">
            <span className="footer-icon">🔒</span>
            <div className="footer-text">
              <strong>Encrypted & Secure</strong>
              <p>All shared files are encrypted and securely stored</p>
            </div>
          </div>
          <div className="footer-info">
            <span className="footer-icon">📋</span>
            <div className="footer-text">
              <strong>Access Logged</strong>
              <p>All access and downloads are logged for security</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default SharedWithMe;