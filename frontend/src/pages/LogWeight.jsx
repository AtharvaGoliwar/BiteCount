import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFetch from "../apiService"; // <-- STEP 1: Import the API helper

// STEP 2: Remove the apiUrl prop
const LogWeight = () => {
  const [weight, setWeight] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight)) {
      toast.warn("Please enter a valid weight.");
      return;
    }

    try {
      // STEP 3: Use apiFetch with the correct endpoint and method
      await apiFetch("/log/weight", "POST", {
        weight: parseFloat(weight),
      });

      toast.success("Weight logged successfully!");
      navigate("/progress"); // Navigate to the progress page to see the new data
    } catch (error) {
      console.error("Failed to log weight:", error);
      toast.error(`Could not log weight: ${error.message}`);
    }
  };

  // The JSX for the form remains exactly the same
  return (
    <div>
      <h1 className="page-title">Log Your Weight</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="weight">Today's Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              id="weight"
              className="form-control"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 75.5"
              required
            />
          </div>
          <button type="submit" className="btn">
            Log Weight
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogWeight;
