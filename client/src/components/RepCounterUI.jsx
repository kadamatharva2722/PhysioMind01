import React from "react";

const RepCounterUI = ({ reps, stage, angle, feedback ,  targetReps
}) => {
  return (
    <div className="session-analysis-card">
      <h2>Session Analysis</h2>

      <div className="session-analysis-grid">
        <div className="analysis-box">
          <small>Reps</small>
          <h3>{reps}</h3>
        </div>

        <div className="analysis-box">
          <small>Stage</small>
          <h3>{stage}</h3>
        </div>

        <div className="analysis-box">
          <small>Angle</small>
          <h3>{angle.toFixed(1)}°</h3>
        </div>

        <div className="analysis-box"><small>Target Reps:</small><br></br><h3>{targetReps ?? "—"}</h3></div>


        <div className="analysis-box feedback-box">
          <small>Form Feedback</small>
          <p>{feedback || "Tracking..."}</p>
        </div>
      </div>
    </div>
  );
};

export default RepCounterUI;




