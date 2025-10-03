import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import ProgressCalendar from "../components/ProgressCalendar";
import { toast } from "react-toastify";
import apiFetch from "../apiService"; // <-- STEP 1: Import your API helper
import Loader from "../components/Loader"; // <-- Import the Loader component
import MacroProgressBar from "../components/MacroProgressBar";

// Helper function to calculate macro goals
const calculateMacroGoals = (profile) => {
  if (!profile) return { protein: 150, carbs: 200, fat: 65 }; // Fallback defaults

  // Priority 1: Use user-defined goals if they exist
  if (profile.macro_goals && profile.macro_goals.protein) {
    return profile.macro_goals;
  }

  // Priority 2: Calculate goals based on weight and calorie goal
  if (profile.current_weight && profile.calorie_goal) {
    const weightKg = profile.current_weight;
    const calorieGoal = profile.calorie_goal;

    // Common calculation: 1.6g protein/kg, 1.0g fat/kg, rest from carbs
    const proteinGoal = Math.round(weightKg * 1.6);
    const fatGoal = Math.round(weightKg * 1.0);
    const carbsCalories = calorieGoal - proteinGoal * 4 - fatGoal * 9;
    const carbsGoal = Math.round(Math.max(0, carbsCalories / 4)); // Ensure carbs are not negative

    return { protein: proteinGoal, carbs: carbsGoal, fat: fatGoal };
  }

  // Priority 3: Fallback defaults
  return { protein: 100, carbs: 100, fat: 100 };
};

// STEP 2: Remove the apiUrl prop. It's no longer needed.
const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [caloriesBurnedInput, setCaloriesBurnedInput] = useState("");
  // const [macros, setMacros] = useState({ consumed: null, goals: null }); // <-- New state for macros

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
      setSummary({
        total_calories: 0,
        calories_burned: 0,
        logged_foods: [],
        macros_consumed: null,
        user_profile: null,
      });
    }
  }, []); // The apiUrl dependency is gone

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate, fetchSummary]);

  const macroGoals = useMemo(
    () => calculateMacroGoals(summary?.user_profile),
    [summary]
  );

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
    return <Loader />;
  }

  const netCalories = summary.total_calories - summary.calories_burned;

  return (
    <div>
      {console.log(summary)}
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

      {/* --- NEW MACROS CARD --- */}
      <div className="card">
        <h3>Macros</h3>
        {summary.macros_consumed && macroGoals ? (
          <div className="macros-container">
            <MacroProgressBar
              label="Protein"
              consumed={summary.macros_consumed.protein}
              goal={macroGoals.protein}
              colorClass="protein"
            />
            <MacroProgressBar
              label="Carbs"
              consumed={summary.macros_consumed.carbs}
              goal={macroGoals.carbs}
              colorClass="carbs"
            />
            <MacroProgressBar
              label="Fat"
              consumed={summary.macros_consumed.fat}
              goal={macroGoals.fat}
              colorClass="fat"
            />
          </div>
        ) : (
          <p>Log food to see your macro breakdown.</p>
        )}
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
        <Link
          to="/log-food"
          state={{ date: selectedDate }} // <-- ADD THIS LINE
          className="btn"
          style={{ marginTop: "20px" }}
        >
          Log More Food
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
