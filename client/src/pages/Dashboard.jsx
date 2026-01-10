import React, { useEffect, useState } from "react";
import { getDashboardSummaryAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardSummaryAPI();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = summary?.todayGoal || {};
  const stats = summary?.stats || {};
  const recentSessions = summary?.recentSessions || [];

  const progress = today.progressPct ?? 0;
  const dayStreak = stats.dayStreak ?? 0;

  if (loading) {
    return (
      <div className="dash-root">
        <Sidebar />
        <main className="dash-main">Loading dashboard…</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-root">
        <Sidebar />
        <main className="dash-main">{error}</main>
      </div>
    );
  }

  return (
    <div className="dash-root">
      <Sidebar />

      <main className="dash-main">
        {/* TOP BAR */}
        <div className="dash-topbar">
          <h1 className="dash-title">Dashboard</h1>

          <div className="dash-topbar-right">
            <div className="dash-search">
              <span className="dash-search-icon">🔍</span>
              <input className="dash-search-input" placeholder="Search..." />
            </div>

            <button className="dash-icon-btn">🔔</button>
            <div className="dash-avatar-small">N</div>
          </div>
        </div>

        <div className="dash-grid">
          {/* 1) TODAY'S PLAN */}
          <section className="dash-card dash-card-wide">
            <div className="dash-card-header-row">
              <div className="dash-card-title-row">
                <span className="dash-card-title-icon">🎯</span>
                <div>
                  <h2 className="dash-card-title">Today&apos;s Plan</h2>
                  <p className="dash-card-sub">
                    Personalized plan for today&apos;s rehab session.
                  </p>
                </div>
              </div>
            </div>

            <div className="dash-goal-body">
              {today.imageUrl && (
                <img
                  src={today.imageUrl}
                  alt="Plan exercise"
                  className="dash-goal-image"
                />
              )}

              <div className="dash-goal-text">
                <div className="dash-goal-name">
                  {today.exerciseName || "—"}
                </div>

                <div className="dash-goal-meta">
                  <span>🔁 {today.reps || "–"} reps / {today.sets || "–"} sets</span>
                  <span>🎯 Target: {today.targetAccuracy ?? "–"}% Accuracy</span>
                </div>

                <div className="dash-progress-label">Progress: {progress}%</div>

                {/* ❗ FIXED: Proper JSX template */}
                <div className="dash-progress-bar">
                  <div
                    className="dash-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2) DAY STREAK */}
          <section className="dash-card dash-card-stat">
            <div className="dash-stat-icon dash-stat-fire">🔥</div>
            <div className="dash-stat-value">{dayStreak}</div>
            <div className="dash-stat-label">Day Streak</div>
          </section>

          {/* 3) RECENT SESSIONS */}
          <section className="dash-card dash-card-full">
            <div className="dash-card-header-row">
              <div className="dash-card-title-row">
                <span className="dash-card-title-icon">📅</span>
                <div>
                  <h2 className="dash-card-title">Recent Sessions</h2>
                  <p className="dash-card-sub">
                    A log of your most recent exercise sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th>Reps</th>
                    <th>Accuracy</th>
                    <th>Duration</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSessions.length === 0 && (
                    <tr>
                      <td colSpan="5">No sessions yet.</td>
                    </tr>
                  )}

                  {recentSessions.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.exercise}</td>
                      <td>{s.reps}</td>
                      <td>{s.accuracy}</td>
                      <td>{s.duration}</td>
                      <td>{s.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4) ANALYTICS BUTTON */}
          <section className="dash-card dash-card-full dash-card-center">
            <button
              className="btn-primary"
              style={{
                marginTop: "16px",
                width: "100%",
                borderRadius: "999px",
                padding: "12px 20px",
                fontSize: "0.95rem",
              }}
              onClick={() => navigate("/analytics")}
            >
              View Detailed Progress Analytics
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
