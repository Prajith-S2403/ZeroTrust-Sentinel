import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b1120",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>

      <Link style={{ color: "#38bdf8" }} to="/">
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;