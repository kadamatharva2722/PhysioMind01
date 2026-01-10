// client/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <header className="home-header">
        <div className="home-header-left">
          <div className="home-logo">PhysioMind</div>
        </div>

        <div className="home-header-right">
          <Link className="home-login-link" to="/login">
            Login
          </Link>
          <Link className="home-signup-btn" to="/signup">
            Sign Up
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <div className="home-root">
        <div className="home-hero">
          {/* LEFT SIDE */}
          <div className="home-left">
            <h1 className="home-title">PhysioMind</h1>
            <h2 className="home-subtitle">AI-Driven Physical Therapy Companion</h2>

            <p className="home-sub">
              Experience a new era of physical therapy with PhysioCare AI. Our
              platform provides real-time posture correction, personalized
              exercise plans, and detailed progress tracking to accelerate your
              recovery.
            </p>

            <Link
              to={localStorage.getItem("token") ? "/dashboard" : "/login"}
              className="home-cta-btn"
            >
              Start Training
            </Link>

          </div>

          {/* RIGHT SIDE */}
          <div className="home-right">
            <div className="home-image-card">
              <img
                src="/Landing.png"
                alt="Physiotherapy abstract"
                className="home-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURES SECTION (scroll to see this) ===== */}
      <section className="home-features">
        <div className="features-header">
          <div className="features-pill">Key Features</div>
          <h2 className="features-title">A Smarter Way to Recover</h2>
          <p className="features-sub">
            Our intelligent features are designed by experts to guide you through
            every step of your physiotherapy journey.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧍‍♂️</div>
            <h3 className="feature-title">Real-time Posture Tracking</h3>
            <p className="feature-text">
              Our AI analyzes your movements to provide instant feedback,
              ensuring perfect form and maximizing results.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3 className="feature-title">Personalized Exercise Plans</h3>
            <p className="feature-text">
              Receive exercise plans tailored to your specific needs, goals, and
              recovery progress.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Progress Analytics</h3>
            <p className="feature-text">
              Track your recovery journey with detailed analytics and
              visualizations of your performance over time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
