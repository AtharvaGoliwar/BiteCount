import React, { useState } from "react";
import "./Modal.css";

const DatePickerModal = ({ currentDate, onClose, onDateSelect }) => {
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth()); // 0-11

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleSelect = () => {
    // We select the first day of the month, the parent component will handle the rest
    onDateSelect(new Date(year, month, 1));
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content card">
        <h3>Select Month and Year</h3>
        <div className="form-group">
          <label>Month</label>
          <select
            className="form-control"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {months.map((m, index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Year</label>
          <select
            className="form-control"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSelect} className="btn">
            Go to Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
