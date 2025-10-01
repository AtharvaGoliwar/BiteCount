import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ProgressCalendar from "../components/ProgressCalendar";
import { toast } from "react-toastify";
import apiFetch from "../apiService"; // <-- STEP 1: Import your API helper
import Loader from "../components/Loader"; // <-- Import the Loader component

// STEP 2: Remove the apiUrl prop. It's no longer needed.
const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [caloriesBurnedInput, setCaloriesBurnedInput] = useState("");

  const fetchSummary = useCallback(async (date) => {
    try {
      // setLoading(true);
      // STEP 3: Use apiFetch and the correct endpoint with "/api"
      const data = await apiFetch(`/summary/${date}`);
      setSummary(data);
      setCaloriesBurnedInput(data.calories_burned || "");
    } catch (err) {
      console.error("Error fetching summary:", err);
      toast.error(`Could not load dashboard data: ${err.message}`);
      // Set a default state on error to prevent crashing
      setSummary({ total_calories: 0, calories_burned: 0, logged_foods: [] });
    }
  }, []); // The apiUrl dependency is gone

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate, fetchSummary]);

  const handleSaveCaloriesBurned = async () => {
    const calories = parseFloat(caloriesBurnedInput);
    if (isNaN(calories) || calories < 0) {
      toast.warn("Please enter a valid number for calories burned.");
      return;
    }

    try {
      // STEP 4: Use apiFetch for the POST request
      setLoading(true);
      await toast.promise(
        apiFetch("/log/activity", "POST", {
          calories_burned: calories,
          date: selectedDate,
        }),
        {
          pending: "Saving activity...",
          success: "Calories burned saved successfully!",
          error: "Failed to save activity.",
        }
      );
      // Refetch the summary to update the net calories display
      fetchSummary(selectedDate);
    } catch (err) {
      // The toast.promise will handle showing the error toast
      console.error("Failed to save activity:", err);
    } finally {
      setLoading(false);
    }
  };

  // A better loading state check
  // if (loading) {
  //   return <p>Loading dashboard...</p>;
  // }

  // Handle the case where the summary couldn't be fetched
  if (!summary) {
    return <p>Could not load data. Is the backend server running?</p>;
  }

  const netCalories = summary.total_calories - summary.calories_burned;

  return (
    <div>
      {loading && <Loader />}
      {/* STEP 5: Remove the apiUrl prop from ProgressCalendar too */}
      <ProgressCalendar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <h1 className="page-title">Dashboard for {selectedDate}</h1>

      <div className="card">
        <h3>Calorie Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="value">{Math.round(summary.total_calories)}</div>
            <div className="label">Intake (kcal)</div>
          </div>
          <div className="summary-item">
            <div className="value">{Math.round(summary.calories_burned)}</div>
            <div className="label">Burned (kcal)</div>
          </div>
        </div>
        <div className="summary-grid" style={{ marginTop: "15px" }}>
          <div
            className="summary-item"
            style={{ gridColumn: "1 / -1", backgroundColor: "#d4edda" }}
          >
            <div className="value">{Math.round(netCalories)}</div>
            <div className="label">Net Calories</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Log Activity / Calories Burned</h3>
        <div className="form-group">
          <input
            type="number"
            className="form-control"
            value={caloriesBurnedInput}
            onChange={(e) => setCaloriesBurnedInput(e.target.value)}
            placeholder="e.g., 300"
          />
        </div>
        <button onClick={handleSaveCaloriesBurned} className="btn">
          Save Burned Calories
        </button>
      </div>

      <div className="card">
        <h3>
          {summary.date === new Date().toISOString().split("T")[0]
            ? "Today's"
            : "Logged"}{" "}
          Food
        </h3>
        {summary.logged_foods.length > 0 ? (
          <ul className="list-group">
            {summary.logged_foods.map((log) => (
              <li key={log._id.$oid} className="list-group-item">
                <span>
                  {log.name} ({log.servings} serving)
                </span>
                <span>{Math.round(log.total_calories)} kcal</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No food logged for this day.</p>
        )}
        <Link to="/log-food" className="btn" style={{ marginTop: "20px" }}>
          Log More Food
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
