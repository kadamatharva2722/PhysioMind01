import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PatientForm from "./pages/PatientForm";
import LiveSession from "./pages/LiveSession";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProgressAnalytics from "./pages/ProgressAnalytics";


import "./styles/frontend.css";
import "./styles/dashboard.css";

export default function App() {
  const location = useLocation();

  // Hide navbar on dashboard pages & live session
  const hideNavbar =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/intake") ||
    location.pathname.startsWith("/exercise");

  return (
    <div className="app-root">
      
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/intake" element={<PatientForm />} />
          <Route path="/exercise" element={<LiveSession />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<ProgressAnalytics />} />

        </Routes>
      </main>
    </div>
  );
}
