// client/src/pages/Profile.jsx
import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/profile.css";

const Profile = () => {
  const [fullName, setFullName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");
  const [dob, setDob] = useState("1990-05-15");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  // 🔹 avatar state
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
  );
  const fileInputRef = useRef(null);

  const handleSave = (e) => {
    e.preventDefault();
    // later: call your API to persist profile + avatar
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setFullName("Jane Doe");
    setEmail("jane.doe@example.com");
    setDob("1990-05-15");
    setPhone("+1 (555) 123-4567");
    setAvatarUrl(
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
    );
  };

  // 🔹 open hidden file input
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 🔹 update preview when user selects a file
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    // (optional) later you can also upload `file` to server here
  };

  return (
    <div className="dash-root">
      <Sidebar />

      <main className="dash-main">
        <div className="profile-page">
          <h1 className="profile-title">Profile</h1>

          {/* MAIN PROFILE CARD */}
          <form className="profile-card" onSubmit={handleSave}>
            {/* hidden file input for avatar */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            <div className="profile-header-row">
              <div className="profile-avatar-wrapper">
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="profile-avatar"
                />
              </div>
              <div className="profile-header-text">
                <h2 className="profile-name">{fullName}</h2>
                <p className="profile-joined">Joined on January 1, 2024</p>
              </div>

              {/* pencil icon – click to change picture */}
              <button
                type="button"
                className="profile-edit-icon-btn"
                title="Change profile picture"
                onClick={handleAvatarClick}
              >
                ✏️
              </button>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <input
                  className="profile-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Email Address</label>
                <input
                  className="profile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Date of Birth</label>
                <input
                  className="profile-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  type="date"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Phone Number</label>
                <input
                  className="profile-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* REPORTS CARD */}
          <section className="profile-card">
            <h2 className="profile-section-title">Reports</h2>
            <p className="profile-section-subtitle">
              Download your progress and session reports.
            </p>

            <div className="profile-report-buttons">
              <button className="profile-report-btn">
                📄 Download Monthly Report
              </button>
              <button className="profile-report-btn">
                ⬇️ Download Full History (PDF)
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
