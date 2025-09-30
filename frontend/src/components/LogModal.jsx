import React, { useState, useEffect } from "react";
// import "./Modal.css"; // We will create this CSS file next
import "./Modal1.css"; // We will create this CSS file next

const LogModal = ({ food, onClose, onLog }) => {
  const [logType, setLogType] = useState("servings"); // 'servings' or 'weight'
  const [amount, setAmount] = useState(food.serving_size);
  const [calculated, setCalculated] = useState({
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
  });

  // Extract the base weight from the serving_size string (e.g., "1 medium (182g)" -> 182)
  //   const baseWeight = parseFloat(
  //     food.serving_size.match(/(\d+(\.\d+)?)/)?.[0] || 100
  //   );
  const baseWeight = food.weight || 100; // Default to 100g if not specified

  useEffect(() => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setCalculated({ calories: 0, macros: { protein: 0, carbs: 0, fat: 0 } });
      return;
    }

    let multiplier = 1;
    if (logType === "servings") {
      multiplier = parseFloat(amount);
    } else {
      // logType === 'weight'
      multiplier = parseFloat(amount) / baseWeight;
    }

    setCalculated({
      calories: Math.round(food.calories * multiplier),
      macros: {
        protein: (food.macros.protein * multiplier).toFixed(1),
        carbs: (food.macros.carbs * multiplier).toFixed(1),
        fat: (food.macros.fat * multiplier).toFixed(1),
      },
    });
  }, [amount, logType, food, baseWeight]);

  const handleLog = () => {
    // We log based on servings, so convert weight to a serving multiplier if needed
    const servingsToLog =
      logType === "servings"
        ? parseFloat(amount)
        : parseFloat(amount) / baseWeight;
    if (servingsToLog > 0) {
      onLog(food, servingsToLog);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content card">
        <h3>Log "{food.name}"</h3>
        <p>
          Base Serving: {food.serving_size} pcs,{baseWeight} g ({food.calories}{" "}
          kcal)
        </p>

        <div className="form-group toggle-group">
          <button
            className={`toggle-btn ${logType === "servings" ? "active" : ""}`}
            onClick={() => setLogType("servings")}
          >
            By Serving
          </button>
          <button
            className={`toggle-btn ${logType === "weight" ? "active" : ""}`}
            onClick={() => setLogType("weight")}
          >
            By Weight (g)
          </button>
        </div>

        <div className="form-group">
          <label>
            {logType === "servings" ? "Number of Servings" : "Weight in Grams"}
          </label>
          <input
            type="number"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={logType === "servings" ? "e.g., 1.5" : "e.g., 220"}
            autoFocus
          />
        </div>

        <div className="summary-card">
          <h4>Calculated Intake</h4>
          <p>
            <strong>Calories:</strong> {calculated.calories} kcal
          </p>
          <p>
            <strong>Macros:</strong> P: {calculated.macros.protein}g / C:{" "}
            {calculated.macros.carbs}g / F: {calculated.macros.fat}g
          </p>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleLog} className="btn">
            Log Food
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
