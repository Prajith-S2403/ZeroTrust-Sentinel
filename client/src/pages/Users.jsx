import { useEffect, useState } from "react";
import API from "../api";
import Sidebar from "../components/Sidebar";
import "./TablePages.css";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data.users);
      } catch (error) {
        alert("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-page">
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">All Users</h2>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role || "user"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;