import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

const Login = ({ navigateTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      // Extract user ID from response
      const userId = response.data.userId;

      // You can save the userId in local storage or a state management library
      localStorage.setItem("userId", userId);

      navigateTo("search"); // Navigate to Search page on successful login
    } catch (error) {
      console.log(error); // Log the error
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert("An error occurred");
      }
    }
  };

  return (
    <div className="login-container animated">
      <h1 className="title">InvestAlytics</h1>
      <p className="description">
        Welcome to InvestAlytics, your expert companion in the financial
        market. Leveraging advanced technical analysis, our platform predicts
        stock trends, categorizing them as neutral, bullish, or bearish. Make
        informed decisions with our insightful guidance.
      </p>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <button type="button" onClick={() => navigateTo("forgotPassword")}>
          Forgot Password
        </button>
        <button type="button" onClick={() => navigateTo("register")}>
          Register Account
        </button>
      </form>
      {/* Footer with your name */}
      <div className="end-of-page-name">Carson Lee</div>
    </div>
  );
};

export default Login;
