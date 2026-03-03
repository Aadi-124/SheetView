import React from "react";
import { getStoredAuth, clearStoredAuth } from "../services/authLocal";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  // Get user details from localStorage
  const auth = getStoredAuth();

  // If nothing exists, redirect or show message
  if (!auth || !auth.isLoggedIn) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Profile Page</h1>
        <p>No user session found.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  const { username, userId, loggedInAt } = auth;

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile Page</h1>

      <p>
        Welcome, <strong>{username}</strong>!
      </p>

      <p>
        <strong>User ID:</strong> {userId}
      </p>

      <p>
        <strong>Logged in at:</strong> {new Date(loggedInAt).toLocaleString()}
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          background: "crimson",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;