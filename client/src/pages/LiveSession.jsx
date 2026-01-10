// client/src/pages/LiveSessionPage.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import WebcamCapture from "../components/WebcamCapture";
import { generateTodayPlanAPI } from "../services/api";
import "../styles/dashboard.css";

export default function LiveSessionPage() {
  const [plan, setPlan] = useState(null);
  const [targetReps, setTargetReps] = useState(null);
  const [loading, setLoading] = useState(false);

  function extractExercises(data) {
    // 1) direct
    if (Array.isArray(data?.exercises)) return data.exercises;

    // 2) nested under "plan"
    if (Array.isArray(data?.plan?.exercises)) return data.plan.exercises;

    // 3) stored as planText JSON
    if (typeof data?.planText === "string") {
      try {
        const parsed = JSON.parse(data.planText);
        if (Array.isArray(parsed.exercises)) return parsed.exercises;
      } catch {
        // ignore parse error
      }
    }

    return [];
  }

  async function handleGeneratePlan() {
    try {
      setLoading(true);
      const data = await generateTodayPlanAPI();

      const exercises = extractExercises(data);
      if (!exercises.length) {
        console.error("Plan from API:", data);
        alert("Invalid plan received from server");
        return;
      }

      const first = exercises[0];
      setPlan({ exercises });
      setTargetReps(first.targetReps || first.target || null);
    } catch (err) {
      console.error("Generate plan error:", err);
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash-root">
      <Sidebar />

      <main className="dash-main">
        <div className="dash-topbar live-topbar-no-nav">
          <h1 className="dash-title">Live Exercise Session</h1>
        </div>

        <div className="dash-grid live-grid">
          {/* LEFT: webcam */}
          <section className="dash-card dash-card-wide live-main-card">
            <WebcamCapture targetReps={targetReps} />
          </section>

          {/* CENTER: AI Session Plan */}
          <section className="dash-card live-metrics-card">
            <h2 className="dash-card-title">AI Session Plan</h2>
            {!plan && (
              <>
                <p className="live-instructions-subtitle">
                  Soon this will generate a personalized rehab plan from your
                  live session data.
                </p>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: "16px", maxWidth: "220px" }}
                  onClick={handleGeneratePlan}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Plan"}
                </button>
              </>
            )}

            {plan && (
              <div className="plan-list">
                {plan.exercises.map((ex, i) => (
                  <div key={i} className="plan-item">
                    <div className="plan-item-name">{ex.name}</div>
                    <div className="plan-item-row">
                      <span>Target Reps:</span>
                      <strong>{ex.targetReps}</strong>
                    </div>
                    <div className="plan-item-row">
                      <span>Sets:</span>
                      <strong>{ex.sets}</strong>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: "16px", maxWidth: "220px" }}
                  onClick={handleGeneratePlan}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Regenerate Plan"}
                </button>
              </div>
            )}
          </section>

          {/* RIGHT: instructions */}
          <section className="dash-card live-instructions-card">
            <h2 className="dash-card-title">Exercise Instructions</h2>
            <p className="live-instructions-subtitle">Knee Extension</p>
            <ol className="live-instructions-list">
              <li>Sit on a chair with your back straight.</li>
              <li>Slowly extend one leg until it is straight out in front.</li>
              <li>Hold the position for 3–5 seconds.</li>
              <li>Slowly lower your leg back to the starting position.</li>
              <li>Repeat for the specified number of repetitions.</li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
