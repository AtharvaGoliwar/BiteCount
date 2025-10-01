import React from "react";
import "./MacroProgressBar.css";

const MacroProgressBar = ({ label, consumed, goal, colorClass }) => {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;

  return (
    <div className="macro-progress-bar">
      <div className="macro-info">
        <span className="macro-label">{label}</span>
        <span className="macro-values">
          {Math.round(consumed)}g / {goal}g
        </span>
      </div>
      <div className="progress-bar-background">
        <div
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MacroProgressBar;
