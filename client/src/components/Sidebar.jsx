// client/src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="dash-sidebar">
      <div>
        <div className="dash-logo-row">
          <div className="dash-logo-circle">▶</div>
          <span className="dash-logo-text">PhysioMind</span>
        </div>

        <nav className="dash-nav">
          <Link
            to="/dashboard"
            className={
              "dash-nav-item " +
              (isActive("/dashboard") ? "dash-nav-item-active" : "")
            }
          >
            <img
              src="https://img.icons8.com/?size=100&id=yBugi9w42EET&format=png&color=000000"
              alt="Dashboard Icon"
              className="sidebar-dashboard-icon"
            />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/intake"
            className={
              "dash-nav-item " +
              (isActive("/intake") ? "dash-nav-item-active" : "")
            }
          >
            <span className="dash-nav-icon">📋</span>
            <span>Patient Form</span>
          </Link>

          <Link
            to="/exercise"
            className={
              "dash-nav-item " +
              (isActive("/exercise") ? "dash-nav-item-active" : "")
            }
          >
            <span className="dash-nav-icon">🎥</span>
            <span>Live Session</span>
          </Link>

          
        </nav>
      </div>

      {/* 🔻 Bottom section: Settings ABOVE Profile, then Logout */}
            <div className="dash-nav-bottom">
        <Link
          to="/settings"
          className={
            "dash-nav-item dash-nav-plain " +
            (isActive("/settings") ? "dash-nav-item-active" : "")
          }
        >
          <span className="dash-nav-icon">⚙️</span>
          <span>Settings</span>
        </Link>

        <Link
          to="/profile"
          className={
            "dash-nav-item dash-nav-plain " +
            (isActive("/profile") ? "dash-nav-item-active" : "")
          }
        >
          <span className="dash-nav-icon">👤</span>
          <span>Profile</span>
        </Link>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          <FiLogOut style={{ marginRight: "8px" }} />
          Log Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
