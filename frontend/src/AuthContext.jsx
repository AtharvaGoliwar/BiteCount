// src/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiFetch from "./apiService"; // <-- IMPORT THE NEW HELPER

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Fetch user profile on app load if token exists
      apiFetch("/profile")
        .then((data) => {
          setUser(data);
          navigate("/dashboard"); // Navigate to dashboard or home page
        })
        .catch(() => {
          // Token is invalid, clear it
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // The response is already parsed JSON from our helper
      const data = await apiFetch("/login", "POST", { email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token);

      const profileData = await apiFetch("/profile");
      setUser(profileData);
      navigate("/dashboard"); // Navigate to dashboard or home page
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error; // Re-throw the error to be caught in the component
    }
  };

  const register = async (
    name,
    email,
    password,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    weight
  ) => {
    try {
      await apiFetch("/register", "POST", {
        name,
        email,
        password,
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatGoal,
        weight,
      });
      // After successful registration, log the user in automatically
      await login(email, password);
    } catch (error) {
      console.error("Registration failed:", error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const value = { user, token, login, logout, register, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
