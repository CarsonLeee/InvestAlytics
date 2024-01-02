import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

const ForgotPassword = ({ navigateTo }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Send a POST request to the reset-password endpoint
      await axios.post("http://localhost:3001/reset-password", {
        email,
        newPassword,
      });
      alert("Password reset successfully");
      navigateTo("login"); // Navigate back to the login page
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert("An error occurred during password reset");
      }
    }
  };

  return (
    <div className="forgot-password-container animated">
      <h1 className="title">Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <button type="submit">Reset Password</button>
        <button type="button" onClick={() => navigateTo("login")}>
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
