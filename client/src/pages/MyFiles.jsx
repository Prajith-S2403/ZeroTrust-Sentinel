import { useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./UserPages.css";

function MyFiles() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await API.get(`/api/files/my-files`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFiles(res.data.files || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
      alert("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      await API.post(`/api/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ File uploaded and encrypted successfully!");
      fetchFiles();
    } catch (error) {
      console.error("Upload failed", error);
      alert(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const openFileBrowser = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

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

  // ✅ FIXED DELETE - Using your backend route /delete/:id
  const deleteFile = async (id) => {
    if (!id) {
      alert("Invalid file ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ Your backend route: /delete/:id
      const response = await API.delete(`/api/files/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response:", response.data);

      // Remove from state
      setFiles((prevFiles) => prevFiles.filter((file) => file._id !== id));
      setSelectedFiles((prev) => prev.filter((fileId) => fileId !== id));

      alert("✅ File deleted successfully!");
      fetchFiles();
    } catch (error) {
      console.error("Delete failed:", error);

      if (error.response?.status === 404) {
        alert("File not found. It may have been already deleted.");
        fetchFiles();
      } else if (error.response?.status === 403) {
        alert("You don't have permission to delete this file.");
      } else {
        alert(error.response?.data?.message || "Failed to delete file. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // ✅ FIXED BULK DELETE
  const deleteSelected = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected");
      return;
    }

    if (
      !window.confirm(`Are you sure you want to delete ${selectedFiles.length} selected files?`)
    ) {
      return;
    }

    setDeleting(true);

    try {
      const token = localStorage.getItem("token");
      let deletedCount = 0;
      let failedCount = 0;

      for (const id of selectedFiles) {
        try {
          // ✅ Your backend route: /delete/:id
          await API.delete(`/api/files/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete file ${id}:`, err);
          failedCount++;
        }
      }

      setFiles((prevFiles) => prevFiles.filter((file) => !selectedFiles.includes(file._id)));
      setSelectedFiles([]);

      if (failedCount === 0) {
        alert(`✅ ${deletedCount} files deleted successfully!`);
      } else {
        alert(`⚠️ ${deletedCount} files deleted, ${failedCount} files failed to delete.`);
      }

      fetchFiles();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete selected files. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f) => f._id));
    }
  };

  const toggleSelectFile = (id) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter((fid) => fid !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.originalname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "📽️";
    if (["zip", "rar", "7z"].includes(ext)) return "📦";
    if (["mp4", "avi", "mkv"].includes(ext)) return "🎬";
    if (["mp3", "wav"].includes(ext)) return "🎵";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div>
      <UserNavbar />

      <div className="user-container">
        <div className="user-page-header">
          <div>
            <h1>My Files</h1>
            <p className="user-subtitle">
              Manage, share, and organize your encrypted files
            </p>
          </div>
          <div className="header-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: "none" }}
              disabled={uploading}
            />

            <button
              className="upload-btn"
              onClick={openFileBrowser}
              disabled={uploading}
            >
              {uploading ? "⏳ Uploading..." : "📤 Upload File"}
            </button>
          </div>
        </div>

        <div className="user-card-grid">
          <div className="user-card">
            <h3>Total Files</h3>
            <p>{files.length}</p>
          </div>
          <div className="user-card">
            <h3>Encrypted</h3>
            <p>{files.filter((f) => f.isEncrypted).length}</p>
          </div>
          <div className="user-card">
            <h3>Total Size</h3>
            <p>
              {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}
            </p>
          </div>
        </div>

        <div className="user-controls">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="controls-actions">
            {selectedFiles.length > 0 && (
              <button
                className="delete-selected-btn"
                onClick={deleteSelected}
                disabled={deleting}
              >
                {deleting
                  ? "⏳ Deleting..."
                  : `🗑 Delete Selected (${selectedFiles.length})`}
              </button>
            )}
            <button
              className="refresh-btn"
              onClick={fetchFiles}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="user-table-card">
          <div className="user-table-header">
            <h3 className="files-icon">File Manager</h3>
            <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {filteredFiles.length} files
            </span>
          </div>

          {loading ? (
            <div className="user-loading">
              <div className="user-loading-spinner"></div>
              <p>Loading your files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="user-empty-state">
              <p>No files found. Upload your first file to get started!</p>
              <button
                className="upload-btn"
                onClick={openFileBrowser}
                style={{ marginTop: "1rem", display: "inline-flex" }}
                disabled={uploading}
              >
                {uploading ? "⏳ Uploading..." : "📤 Upload Now"}
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="user-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={
                          selectedFiles.length === filteredFiles.length &&
                          filteredFiles.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr
                      key={file._id}
                      className={
                        selectedFiles.includes(file._id) ? "selected-row" : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file._id)}
                          onChange={() => toggleSelectFile(file._id)}
                        />
                      </td>
                      <td>
                        <div className="file-info">
                          <span className="file-icon">
                            {getFileIcon(file.originalname)}
                          </span>
                          <span className="file-name">{file.originalname}</span>
                        </div>
                      </td>
                      <td>{formatFileSize(file.size)}</td>
                      <td>
                        <span
                          className={`file-status ${
                            file.isEncrypted ? "encrypted" : "pending"
                          }`}
                        >
                          {file.isEncrypted ? "🔒 Encrypted" : "📄 Pending"}
                        </span>
                      </td>
                      <td>
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="file-actions">
                          <button
                            className="file-btn download"
                            onClick={() =>
                              downloadFile(file._id, file.originalname)
                            }
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
                            disabled={deleting}
                          >
                            {deleting ? "⏳" : "🗑 Delete"}
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
      </div>
    </div>
  );
}

export default MyFiles;