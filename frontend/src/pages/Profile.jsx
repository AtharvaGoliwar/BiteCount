// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import apiFetch from "../apiService"; // <-- IMPORT THE NEW HELPER
import "./Auth.css"; // Import the new CSS
import Loader from "../components/Loader";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    height_cm: "",
    weight_kg: "",
    target_weight_kg: "",
    daily_calories_goal: "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        height_cm: user.profile.height_cm || "",
        weight_kg: user.profile.weight_kg || "",
        target_weight_kg: user.profile.target_weight_kg || "",
        daily_calories_goal: user.profile.daily_calories_goal || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        name: formData.name,
        profile: {
          height_cm: Number(formData.height_cm),
          weight_kg: Number(formData.weight_kg),
          target_weight_kg: Number(formData.target_weight_kg),
          daily_calories_goal: Number(formData.daily_calories_goal),
        },
      };
      setLoading(true);
      await apiFetch("/profile", "PUT", payload); // <-- USE apiFetch

      // Update user context locally
      setUser((prevUser) => ({ ...prevUser, ...payload }));
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      setLoading(true);
      await apiFetch("/change-password", "POST", passwordData); // <-- USE apiFetch
      setMessage("Password changed successfully!");
      setPasswordData({ old_password: "", new_password: "" });
    } catch (error) {
      setMessage(`Failed to change password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // ... (The JSX part of the component remains exactly the same) ...
  return (
    <div className="auth-container">
      {loading && <Loader />}
      <h2>Your Profile</h2>
      {message && <p className="profile-message">{message}</p>}

      <div className="profile-section">
        <h3>Update Your Details</h3>
        <form onSubmit={handleProfileSubmit} className="auth-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Height (cm):</label>
            <input
              type="number"
              name="height_cm"
              value={formData.height_cm}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Weight (kg):</label>
            <input
              type="number"
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Target Weight (kg):</label>
            <input
              type="number"
              name="target_weight_kg"
              value={formData.target_weight_kg}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Daily Calories Goal:</label>
            <input
              type="number"
              name="daily_calories_goal"
              value={formData.daily_calories_goal}
              onChange={handleProfileChange}
            />
          </div>
          <button type="submit" className="auth-btn">
            Update Profile
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <div className="form-group">
            <label>Old Password:</label>
            <input
              type="password"
              name="old_password"
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="auth-btn">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
