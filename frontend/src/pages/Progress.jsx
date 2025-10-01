import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import apiFetch from "../apiService"; // <-- STEP 1: Import the API helper
import { toast } from "react-toastify"; // <-- Import toast for error handling
import Loader from "../components/Loader"; // <-- Import the Loader component

// Chart.js registration remains the same
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// STEP 2: Remove the apiUrl prop
const Progress = () => {
  const [weightData, setWeightData] = useState(null);
  const [calorieData, setCalorieData] = useState(null);
  const [progressCheck, setProgressCheck] = useState(null);
  const [loading, setLoading] = useState(true); // <-- Add a loading state

  useEffect(() => {
    // STEP 3: Consolidate all data fetching into one function
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        // Use Promise.all to run all requests in parallel for faster loading
        const [weightRes, calorieRes, checkRes] = await Promise.all([
          apiFetch("/progress/weight"),
          apiFetch("/progress/calories"),
          apiFetch("/progress/check"),
        ]);

        // Process weight data
        if (weightRes && weightRes.length > 0) {
          const weightChartData = {
            labels: weightRes.map((d) => d.date),
            datasets: [
              {
                label: "Weight (kg)",
                data: weightRes.map((d) => d.weight),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          };
          setWeightData(weightChartData);
        }

        // Process calorie data
        if (calorieRes && calorieRes.length > 0) {
          const calorieChartData = {
            labels: calorieRes.map((d) => d._id),
            datasets: [
              {
                label: "Daily Calorie Intake",
                data: calorieRes.map((d) => d.total_calories),
                borderColor: "rgb(255, 99, 132)",
                tension: 0.1,
              },
            ],
          };
          setCalorieData(calorieChartData);
        }

        // Process progress check
        if (checkRes) {
          setProgressCheck(checkRes);
        }
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
        toast.error("Could not load your progress data.");
      } finally {
        setLoading(false); // Stop loading, whether successful or not
      }
    };

    fetchProgressData();
  }, []); // STEP 4: Use an empty dependency array to run only once

  // if (loading) {
  //   return <p style={{ textAlign: "center" }}>Loading your progress...</p>;
  // }

  // The JSX part of the component remains the same
  return (
    <div>
      {loading && <Loader />}
      <h1 className="page-title">Your Progress</h1>

      {progressCheck && (
        <div
          className={`notification ${
            progressCheck.on_track === true
              ? "success"
              : progressCheck.on_track === false
              ? "warning"
              : ""
          }`}
        >
          <strong>Progress Update:</strong> {progressCheck.message}
        </div>
      )}

      <div className="card">
        <h3>Weight Trend</h3>
        {weightData ? (
          <Line data={weightData} />
        ) : (
          <p>Log your weight to see a trend chart.</p>
        )}
      </div>

      <div className="card">
        <h3>Calorie Intake (Last 30 Days)</h3>
        {calorieData ? (
          <Line data={calorieData} />
        ) : (
          <p>Log your food intake to see a calorie chart.</p>
        )}
      </div>
    </div>
  );
};

export default Progress;
