import { useState, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./UploadFile.css";

function UploadFile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile) => {
    setError("");
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      setFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip', 'application/x-rar-compressed',
      'video/mp4', 'video/avi', 'video/mkv',
      'audio/mp3', 'audio/wav'
    ];

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|jpg|jpeg|png|gif|webp|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|mp4|avi|mkv|mp3|wav)$/i)) {
      setError("File type not supported");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post(
        "/api/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("✅ File uploaded and encrypted successfully!");
        setFile(null);
        setUploadProgress(0);
        setTimeout(() => navigate("/my-files"), 1500);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error.response?.data?.message || "File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // ✅ FIX: Open file browser directly
  const openFileBrowser = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div>
      <UserNavbar />

      <div className="user-container">
        <div className="user-page-header">
          <div>
            <h1>Upload File</h1>
            <p className="user-subtitle">
              Upload and encrypt your files securely with ZeroTrustX protection
            </p>
          </div>
          <div className="header-actions">
            <button className="back-btn" onClick={() => navigate("/my-files")}>
              ← Back to Files
            </button>
          </div>
        </div>

        <div className="upload-main-container">
          {/* File Upload Card */}
          <div className="upload-card">
            <form onSubmit={handleUpload}>
              {/* ✅ Click on dropzone opens file browser */}
              <div 
                className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileBrowser}
                style={{ cursor: uploading ? 'default' : 'pointer' }}
              >
                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />

                {file ? (
                  <div className="selected-file-info">
                    <div className="selected-file-icon">📄</div>
                    <div className="selected-file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </span>
                      <span className="file-status-badge">Ready to upload</span>
                    </div>
                    <button 
                      type="button" 
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // ✅ Prevent opening file browser
                        clearFile();
                      }}
                      disabled={uploading}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <div className="dropzone-icon">📁</div>
                    <p className="dropzone-title">Drag & drop your file here</p>
                    <p className="dropzone-hint">or click to browse files</p>
                    <div className="dropzone-formats">
                      <span>📄 PDF</span>
                      <span>🖼️ Images</span>
                      <span>📝 Documents</span>
                      <span>📊 Spreadsheets</span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="upload-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div className="upload-progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-info">
                    <span className="progress-text">
                      {uploadProgress < 100 ? 'Uploading...' : 'Processing encryption...'}
                    </span>
                    <span className="progress-percentage">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              <div className="upload-actions">
                <button 
                  type="button" 
                  className="browse-btn-secondary"
                  onClick={openFileBrowser}
                  disabled={uploading}
                >
                  📂 Browse Files
                </button>
                <button 
                  type="submit" 
                  className={`upload-submit-btn ${!file || uploading ? 'disabled' : ''}`}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    '🔒 Upload & Encrypt'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Upload Info Cards */}
          <div className="upload-info-grid">
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <div className="info-content">
                <h4>ZeroTrust Encryption</h4>
                <p>All files are encrypted automatically using AES-256 encryption</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📋</div>
              <div className="info-content">
                <h4>Audit Logging</h4>
                <p>All uploads are logged for security and compliance purposes</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">👥</div>
              <div className="info-content">
                <h4>Secure Sharing</h4>
                <p>Share encrypted files securely with other users</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">⚡</div>
              <div className="info-content">
                <h4>Fast & Reliable</h4>
                <p>Optimized upload with progress tracking</p>
              </div>
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="upload-guidelines">
            <h4>📋 Upload Guidelines</h4>
            <div className="guidelines-grid">
              <div className="guideline-item">
                <span className="guideline-icon">✅</span>
                <div>
                  <strong>Supported Formats</strong>
                  <p>PDF, Images, Documents, Spreadsheets, Presentations</p>
                </div>
              </div>
              <div className="guideline-item">
                <span className="guideline-icon">📊</span>
                <div>
                  <strong>File Size Limit</strong>
                  <p>Maximum 50MB per file</p>
                </div>
              </div>
              <div className="guideline-item">
                <span className="guideline-icon">🔐</span>
                <div>
                  <strong>Security</strong>
                  <p>All files are encrypted before storage</p>
                </div>
              </div>
              <div className="guideline-item">
                <span className="guideline-icon">⏱️</span>
                <div>
                  <strong>Retention</strong>
                  <p>Files stored securely until you delete them</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadFile;