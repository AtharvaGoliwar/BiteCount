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

  // --- NEW: State for goal inputs ---
  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [carbsGoal, setCarbsGoal] = useState("");
  const [fatGoal, setFatGoal] = useState("");
  const [weight, setWeight] = useState("");

  // --- DEBUGGING STEP ---
  // Before submitting, log the values to the console to be 100% sure they are strings.
  console.log("Submitting registration with:", {
    name,
    email,
    password,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    weight,
  });
  // If you see an <input> element logged here, you've found the problem!

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await register(
        name,
        email,
        password,
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatGoal,
        weight
      );
    } catch (err) {
      setError("Failed to register. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container card">
      {loading && <Loader />}

      <div className="auth-header">
        <img
          src="/bitecount-logo.png"
          alt="BiteCount logo"
          className="logo-icon"
        />
        <h1 className="brand-title">BiteCount</h1>
      </div>

      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* --- CRITICAL: CHECK EVERY onChange HANDLER BELOW --- */}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="weight">Current Weight (kg)</label>
          <input
            type="number"
            id="weight"
            className="form-control"
            placeholder="e.g., 80"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <fieldset className="goals-fieldset">
          <legend>Set Your Daily Goals (Optional)</legend>
          <div className="form-group">
            <label htmlFor="calorieGoal">Calorie Goal (kcal)</label>
            <input
              type="number"
              id="calorieGoal"
              className="form-control"
              placeholder="e.g., 2000"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
            />
          </div>
          <div className="macro-goals-group">
            <div className="form-group">
              <label htmlFor="proteinGoal">Protein (g)</label>
              <input
                type="number"
                id="proteinGoal"
                className="form-control"
                placeholder="e.g., 150"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbsGoal">Carbs (g)</label>
              <input
                type="number"
                id="carbsGoal"
                className="form-control"
                placeholder="e.g., 200"
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fatGoal">Fat (g)</label>
              <input
                type="number"
                id="fatGoal"
                className="form-control"
                placeholder="e.g., 65"
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="btn">
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
