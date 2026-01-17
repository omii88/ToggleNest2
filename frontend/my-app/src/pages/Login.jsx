import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../theme/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔥 CALL BACKEND LOGIN API
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // 🔥 SAVE JWT TOKEN
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.name);
      sessionStorage.setItem("loggedIn", "true");

      // optional: save user info
      // localStorage.setItem("user", JSON.stringify(res.data.user));

      // 🔥 REDIRECT TO DASHBOARD
      navigate("/dashboard");

    } catch (error) {
      alert(error.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn" type="submit">Login</button>

        <p className="auth-text">
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
