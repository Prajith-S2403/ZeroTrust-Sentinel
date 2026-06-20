import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";
import "./Threats.css";

function MLThreats() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/ml-threats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setResults(res.data.results);
      } catch (error) {
        alert("Failed to fetch ML threat scores");
      }
    };

    fetchThreats();
  }, []);

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">ML Threat Detection</h2>
<div className="threat-grid">
  <div className="threat-card">
    <h3>High Risk Users</h3>
    <p>{results.filter((u) => u.riskLevel === "HIGH").length}</p>
  </div>

  <div className="threat-card">
    <h3>Medium Risk Users</h3>
    <p>{results.filter((u) => u.riskLevel === "MEDIUM").length}</p>
  </div>

  <div className="threat-card">
    <h3>Low Risk Users</h3>
    <p>{results.filter((u) => u.riskLevel === "LOW").length}</p>
  </div>

  <div className="threat-card">
    <h3>Avg Threat Score</h3>
    <p>
      {results.length === 0
        ? 0
        : Math.round(
            results.reduce((sum, u) => sum + u.threatScore, 0) /
              results.length
          )}
    </p>
  </div>
</div>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Uploads</th>
                <th>Downloads</th>
                <th>Shares</th>
                <th>Deletes</th>
                <th>Unauthorized</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {results.map((item) => (
                <tr key={item.userId}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.uploads}</td>
                  <td>{item.downloads}</td>
                  <td>{item.shares}</td>
                  <td>{item.deletes}</td>
                  <td>{item.unauthorizedAttempts}</td>
                  <td>{item.threatScore}</td>
                  <td
                    className={
                      item.riskLevel === "HIGH"
                        ? "threat-high"
                        : item.riskLevel === "MEDIUM"
                        ? "threat-medium"
                        : "threat-low"
                    }
                  >
                    {item.riskLevel}
                  </td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MLThreats;