// client/src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/frontend.css";
import "../styles/settings.css";

const SettingsPage = () => {
  // ---------- DARK MODE ----------
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // ---------- NOTIFICATIONS ----------
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const handleSaveSettings = () => {
    // In real app send to backend
    console.log("Saving settings:", {
      emailNotifications,
      sessionReminders,
      darkMode,
    });
    setSettingsMessage("Settings saved successfully.");
    setTimeout(() => setSettingsMessage(""), 2500);
  };

  // ---------- PASSWORD CHANGE ----------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSavePassword = () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    // Here you would call your backend to update the password.
    console.log("Password changed:", { currentPassword, newPassword });

    setPasswordMessage("✅ Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setPasswordMessage(""), 3000);
  };

  return (
    <div className="dash-root">
      <Sidebar />

      <main className="dash-main">
        <h1 className="dash-title">Settings</h1>

        {/* ---------- CHANGE PASSWORD CARD ---------- */}
        <section className="page-card" style={{ maxWidth: "1100px" }}>
          <h2 className="section-title">Security</h2>
          <p className="section-subtitle">
            Update your account password to keep your profile secure.
          </p>

          <div className="form-grid">
            <div className="form-row full-width">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="form-row full-width" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ maxWidth: "220px" }}
                onClick={handleSavePassword}
              >
                Save Password
              </button>
            </div>

            {passwordError && (
              <p style={{ color: "#dc2626", marginTop: "0.4rem" }}>
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p style={{ color: "#16a34a", marginTop: "0.4rem" }}>
                {passwordMessage}
              </p>
            )}
          </div>
        </section>

        {/* ---------- NOTIFICATIONS CARD ---------- */}
        <section
          className="page-card"
          style={{ maxWidth: "1100px", marginTop: "1.5rem" }}
        >
          <h2 className="section-title">Notifications</h2>
          <p className="section-subtitle">
            Choose how you want to be notified.
          </p>

          <div className="setting-card">
            <div className="setting-item">
              <div>
                <strong>Email Notifications</strong>
                <p>Receive updates about your progress and new features.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <hr className="setting-divider" />

            <div className="setting-item">
              <div>
                <strong>Session Reminders</strong>
                <p>Get a reminder 15 minutes before a scheduled session.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={sessionReminders}
                  onChange={(e) => setSessionReminders(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </section>

        {/* ---------- THEME CARD ---------- */}
        <section
          className="page-card"
          style={{ maxWidth: "1100px", marginTop: "1.5rem" }}
        >
          <h2 className="section-title">Theme</h2>
          <p className="section-subtitle">
            Customize how PhysioCare AI looks for you.
          </p>

          <div className="setting-card">
            <div className="setting-item">
              <div>
                <strong>Dark Mode</strong>
                <p>Toggle between light and dark themes.</p>
              </div>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
            <button
              type="button"
              className="btn-primary"
              style={{ maxWidth: "200px" }}
              onClick={handleSaveSettings}
            >
              Save Settings
            </button>
          </div>

          {settingsMessage && (
            <p
              style={{
                color: "#16a34a",
                marginTop: "0.5rem",
                textAlign: "right",
              }}
            >
              {settingsMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
