import React, { useEffect, useState } from "react";
import { getHistoryAPI } from "../services/api";

export default function ProgressHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getHistoryAPI();
    setHistory(res.history);
  };

  return (
    <div className="page">
      <h2>Your Progress</h2>

      <div className="history-list">
        {history.map((s, i) => (
          <div className="card session-item" key={i}>
            <h4>Session {i + 1}</h4>
            <p>Reps: {s.completedReps}</p>
            <p>Accuracy: {s.accuracy}%</p>
            <p>Duration: {s.durationSeconds}s</p>
            <p>Date: {new Date(s.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
 
