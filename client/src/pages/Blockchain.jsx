import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";

function Blockchain() {
  const [logs, setLogs] = useState([]);
  const [verify, setVerify] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const token = localStorage.getItem("token");

        const logsRes = await API.get(
          "/api/admin/blockchain",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const verifyRes = await API.get(
          "/api/admin/blockchain/verify",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLogs(logsRes.data.logs || []);
        setVerify(verifyRes.data);
      } catch (error) {
        console.error("Failed to fetch blockchain logs", error);
        alert("Failed to fetch blockchain logs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();
  }, []);

  const filteredLogs = logs
    .filter((log) => {
      if (filter === "all") return true;
      if (filter === "valid") return log.status === "VALID";
      if (filter === "tampered") return log.status === "TAMPERED";
      return true;
    })
    .filter((log) => {
      if (!searchTerm) return true;
      return (
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.fileId?.originalname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.hash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const getActionClass = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("upload")) return "upload";
    if (actionLower.includes("download")) return "download";
    if (actionLower.includes("share")) return "share";
    if (actionLower.includes("delete")) return "delete";
    if (actionLower.includes("unauthorized")) return "unauthorized";
    return "";
  };

  const truncateHash = (hash) => {
    if (!hash) return "N/A";
    if (hash === "GENESIS") return "GENESIS";
    return hash.length > 16
      ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`
      : hash;
  };

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <div className="page-header">
          <div>
            <h2 className="page-title">🔗 Blockchain Audit Logs</h2>
            <p className="page-subtitle">
              Immutable ledger records with cryptographic verification
            </p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {verify && (
          <div className="blockchain-stats">
            <div className="stat-card">
              <div style={{ fontSize: "2rem" }}>🔗</div>
              <h4>Blockchain Status</h4>
              <p style={{ 
                color: verify.status === "VALID" ? "#34d399" : "#f87171",
                fontSize: "1.5rem"
              }}>
                {verify.status === "VALID" ? "✓ VERIFIED" : "⚠ TAMPERED"}
              </p>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: "2rem" }}>📦</div>
              <h4>Total Blocks</h4>
              <p>{verify.totalBlocks || 0}</p>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: "2rem" }}>🔒</div>
              <h4>Valid Blocks</h4>
              <p style={{ color: "#34d399" }}>
                {(verify.totalBlocks || 0) - (verify.tamperedBlocks || 0)}
              </p>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: "2rem" }}>⚠️</div>
              <h4>Tampered Blocks</h4>
              <p style={{ color: "#f87171" }}>
                {verify.tamperedBlocks || 0}
              </p>
            </div>
          </div>
        )}

        {/* Blockchain Visualization */}
        <div className="table-card" style={{ marginBottom: "1.5rem" }}>
          <h3>🔗 Blockchain Visualization</h3>
          <div className="blockchain-chain">
            {logs.slice(0, 10).map((log, index) => (
              <div key={log._id} className="block-node">
                <div
                  className={`block-node-content ${
                    log.status === "TAMPERED" ? "tampered" : "valid"
                  }`}
                >
                  <span className="block-index">#{index + 1}</span>
                  <span className="block-hash-short">
                    {truncateHash(log.hash)}
                  </span>
                </div>
                {index < logs.length - 1 && index < 9 && (
                  <div className="block-arrow">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-header">
            <h3>📜 Blockchain Ledger</h3>
            <div className="table-controls">
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Blocks</option>
                <option value="valid">Valid Only</option>
                <option value="tampered">Tampered Only</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading blockchain data...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User</th>
                    <th>File</th>
                    <th>Hash</th>
                    <th>Previous</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        No blockchain records found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className={log.status === "TAMPERED" ? "tampered-row" : ""}>
                        <td>
                          <span className={`action-badge ${getActionClass(log.action)}`}>
                            {log.action || "Unknown"}
                          </span>
                        </td>
                        <td>{log.userId?.email || "Unknown"}</td>
                        <td>{log.fileId?.originalname || "N/A"}</td>
                        <td className="hash-cell">
                          <code className="hash-text">{truncateHash(log.hash)}</code>
                        </td>
                        <td className="hash-cell">
                          <code className="hash-text">{truncateHash(log.previousHash)}</code>
                        </td>
                        <td>
                          {log.status === "VALID" ? (
                            <span className="status-badge success">✓ Valid</span>
                          ) : log.status === "TAMPERED" ? (
                            <span className="status-badge danger">⚠ Tampered</span>
                          ) : (
                            <span className="status-badge">? Unknown</span>
                          )}
                        </td>
                        <td className="time-cell">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="blockchain-footer">
          <div className="info-box">
            <span className="info-icon">🔐</span>
            <div className="info-text">
              <strong>Immutable Ledger</strong>
              <p>Each block is cryptographically linked using SHA-256 hashing</p>
            </div>
          </div>
          <div className="info-box">
            <span className="info-icon">✓</span>
            <div className="info-text">
              <strong>Verification Status</strong>
              <p>Chain integrity verified using hash chain validation</p>
            </div>
          </div>
          <div className="info-box">
            <span className="info-icon">🛡️</span>
            <div className="info-text">
              <strong>Tamper Detection</strong>
              <p>Any modification breaks the cryptographic chain</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blockchain;