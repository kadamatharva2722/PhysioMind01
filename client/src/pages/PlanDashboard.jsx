import React, { useEffect, useState } from "react";
import { getPlanAPI } from "../services/api";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function PlanDashboard() {
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    const res = await getPlanAPI();
    setPlan(res.plan);
  };

  return (
    <div className="page">
      <h2>Your Daily Physiotherapy Plan</h2>

      {!plan ? (
        <p>Loading plan...</p>
      ) : (
        <div className="card plan-card">
          <h3>{plan.exerciseName}</h3>
          <p>Target Reps: {plan.targetReps}</p>
          <p>LLM Notes: {plan.llmNotes}</p>
        </div>
      )}

      <Button text="Start Exercise" onClick={() => navigate("/exercise")} />
    </div>
  );
}
