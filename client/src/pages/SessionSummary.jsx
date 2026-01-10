import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function SessionSummary({ session }) {
  const navigate = useNavigate();

  return (
    <div className="centered-page">
      <div className="card summary-card">
        <h2>Session Summary</h2>

        <p>Reps Completed: {session.completedReps}</p>
        <p>Accuracy: {session.accuracy}%</p>
        <p>Duration: {session.durationSeconds}s</p>

        <Button text="Go to Dashboard" onClick={() => navigate("/plan")} />
      </div>
    </div>
  );
}
