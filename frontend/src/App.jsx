import React from "react";
import {
  BrowserRouter as Router, // <-- Main change is here
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Authentication Components ---
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// --- Your Existing Pages & Components ---
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LogFood from "./pages/LogFood";
import AddFood from "./pages/AddFood";
import LogWeight from "./pages/LogWeight";
import Progress from "./pages/Progress";
// import "./App.css";
import "./App1.css";

// This component remains the same
const ProtectedLayout = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    // FIX: <Router> must be the top-level component that wraps everything else.
    <Router>
      {/* Now AuthProvider is inside the Router, so it can use useNavigate() */}
      <AuthProvider>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log-food" element={<LogFood />} />
            <Route path="/add-food" element={<AddFood />} />
            <Route path="/log-weight" element={<LogWeight />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
