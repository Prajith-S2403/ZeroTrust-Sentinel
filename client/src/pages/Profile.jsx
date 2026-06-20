import Sidebar from "../components/Sidebar";
import UserNavbar from "../components/UserNavbar";
import "./Profile.css";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  return (
    <div className={isAdmin ? "admin-page" : ""}>
      {/* ✅ Show Sidebar for Admin, UserNavbar for User */}
      {isAdmin ? <Sidebar /> : <UserNavbar />}

      <div className={`page-container ${isAdmin ? 'admin-profile' : 'user-profile'}`}>

        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0) || "U"}
          </div>

          <h2 className="profile-title">👤 My Profile</h2>

          <div className="profile-row">
            <span>Full Name</span>
            <strong>{user?.name || "N/A"}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{user?.email || "N/A"}</strong>
          </div>

          <div className="profile-row">
            <span>Role</span>
            <strong className={isAdmin ? "role-admin" : "role-user"}>
              {isAdmin ? "🛡️ Administrator" : "👤 User"}
            </strong>
          </div>

          <div className="profile-row">
            <span>Status</span>
            <strong className="active-status">✅ Active</strong>
          </div>

          <div className="profile-row">
            <span>Account ID</span>
            <strong className="account-id">#{user?._id?.slice(-8) || "N/A"}</strong>
          </div>

          <button
            className="logout-btn-profile"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                window.location.href = "/";
              }
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;