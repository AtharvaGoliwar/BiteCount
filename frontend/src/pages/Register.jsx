import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
// import "./Auth.css"; // Import the new CSS
import "./Auth1.css"; // Import the new CSS
import Loader from "../components/Loader";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await register(name, email, password);
    } catch (err) {
      setError("Failed to register. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {loading && <Loader />}
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src="/cookie_x192.png" alt="icon" className="logo-icon" />
        <span style={{ color: "#3498db" }}>BiteCount</span>
      </h1>
      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />
        </div>
        <button type="submit" className="auth-btn">
          Register
        </button>
      </form>
      <p className="switch-auth-link">
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
