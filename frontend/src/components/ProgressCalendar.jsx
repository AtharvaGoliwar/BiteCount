// src/components/ProgressCalendar.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import DatePickerModal from "./DatePickerModal";
import apiFetch from "../apiService";
import "./ProgressCalendar.css"; // We'll use the improved CSS file

// FIX 1: Correctly format date to 'YYYY-MM-DD' using local timezone parts.
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ProgressCalendar = ({ selectedDate, onDateChange }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(selectedDate)
  );
  const [monthSummary, setMonthSummary] = useState({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const today = useMemo(() => formatDate(new Date()), []);
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]; // Shorter for small screens

  // IMPROVEMENT 1: Sync internal state when the selectedDate prop changes from the parent.
  useEffect(() => {
    // This ensures that if the parent changes the date, the calendar view updates.
    // We add a day to the date string to handle timezone parsing correctly.
    // "2023-10-20" can be parsed as UTC midnight, which might be "2023-10-19" locally.
    // "2023-10-20T12:00:00" is safer.
    const safeDate = new Date(`${selectedDate}T12:00:00`);
    setCurrentMonthDate(safeDate);
  }, [selectedDate]);

  const fetchMonthSummary = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    try {
      const data = await apiFetch(`/month-summary/${year}/${month}`);
      setMonthSummary(data);
    } catch (error) {
      console.error("Failed to fetch month summary:", error);
      toast.error("Could not load calendar summary.");
    }
  }, []);

  useEffect(() => {
    fetchMonthSummary(currentMonthDate);
  }, [currentMonthDate, fetchMonthSummary]);

  const handleMonthChange = (offset) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + offset, 1);
    setCurrentMonthDate(newDate);
  };

  const handleDateSelectFromPicker = (date) => {
    setCurrentMonthDate(date);
    onDateChange(formatDate(date));
    setIsPickerOpen(false); // Close modal after selection
  };

  // IMPROVEMENT 2: Memoize the calendar grid calculation for performance.
  // This avoids recalculating the grid on every single render.
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const status = monthSummary[dateStr];

      const classNames = [
        "calendar-day",
        status, // 'success' or 'failure'
        dateStr === selectedDate ? "selected" : "",
        dateStr === today ? "today" : "",
      ].join(" ");

      days.push(
        // IMPROVEMENT 3: Use <button> for accessibility (keyboard navigation & screen readers)
        <button
          key={dateStr}
          className={classNames}
          onClick={() => onDateChange(dateStr)}
          aria-label={`Select date ${date.toLocaleDateString()}`}
        >
          <span>{day}</span>
        </button>
      );
    }
    return days;
  }, [currentMonthDate, monthSummary, selectedDate, today, onDateChange]);

  return (
    <div className="calendar-container card">
      {isPickerOpen && (
        <DatePickerModal
          currentDate={currentMonthDate}
          onClose={() => setIsPickerOpen(false)}
          onDateSelect={handleDateSelectFromPicker}
        />
      )}
      <div className="calendar-header">
        {/* IMPROVEMENT 4: Better Accessibility for buttons */}
        <button
          className="calendar-nav-btn"
          onClick={() => handleMonthChange(-1)}
          aria-label="Previous month"
        >
          &lt;
        </button>
        <button
          className="current-month"
          onClick={() => setIsPickerOpen(true)}
          aria-label="Open month and year picker"
        >
          {currentMonthDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
          <span className="picker-icon" aria-hidden="true">
            📅
          </span>
        </button>
        <button
          className="calendar-nav-btn"
          onClick={() => handleMonthChange(1)}
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="day-of-week">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
};

export default ProgressCalendar;
