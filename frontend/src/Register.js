import React, { useState } from "react";
import axios from "axios";
import './Search.css';

const Register = ({ navigateTo }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:3001/register", { email, password });
      alert("User registered successfully");
    } catch (error) {
      console.log(error); // Add this line
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert("An error occurred");
      }
    }
  };

  return (
    <div className="register-container animated">
      <h1 className="title">Register Account</h1>
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
        <button type="submit">Register</button>
        <button type="button" onClick={() => navigateTo("login")}>
          Back to Login
        </button>
      </form>
    </div>
  );
  
};

export default Register;
