// client/src/pages/ProgressAnalytics.jsx
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "../styles/dashboard.css";

// --- STATIC 7-DAY DATA (hard-coded) ---
let summaryData = [
  { day: "1", targetReps: 10, completedReps: 6, avgAngle: 85, maxAngle: 175, minAngle: 7, accuracy: 100, duration: 91, correctFrames: 120 },
  { day: "2", targetReps: 10, completedReps: 8, avgAngle: 90, maxAngle: 178, minAngle: 10, accuracy: 98, duration: 80, correctFrames: 230 },
  { day: "3", targetReps: 12, completedReps: 10, avgAngle: 92, maxAngle: 180, minAngle: 12, accuracy: 97, duration: 78, correctFrames: 350 },
  { day: "4", targetReps: 12, completedReps: 11, avgAngle: 95, maxAngle: 182, minAngle: 14, accuracy: 98, duration: 75, correctFrames: 480 },
  { day: "5", targetReps: 14, completedReps: 12, avgAngle: 97, maxAngle: 185, minAngle: 16, accuracy: 99, duration: 72, correctFrames: 620 },
  { day: "6", targetReps: 14, completedReps: 13, avgAngle: 100, maxAngle: 187, minAngle: 18, accuracy: 99, duration: 70, correctFrames: 780 },
  { day: "7", targetReps: 15, completedReps: 14, avgAngle: 102, maxAngle: 188, minAngle: 20, accuracy: 100, duration: 68, correctFrames: 950 },
];

// Add missing cumulativeCorrectFrames
summaryData = summaryData.map((d, i) => ({
  ...d,
  cumulativeCorrectFrames: summaryData
    .slice(0, i + 1)
    .reduce((sum, x) => sum + x.correctFrames, 0),
}));

const totalTarget = summaryData.reduce((s, d) => s + d.targetReps, 0);
const totalCompleted = summaryData.reduce((s, d) => s + d.completedReps, 0);
const avgAccuracy = summaryData.reduce((s, d) => s + d.accuracy, 0) / summaryData.length;
const avgDuration = summaryData.reduce((s, d) => s + d.duration, 0) / summaryData.length;
const peakMaxAngle = Math.max(...summaryData.map((d) => d.maxAngle));

export default function ProgressAnalytics() {
  return (
    <div className="dash-root">
      <main className="dash-main" style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
          7-Day Personalized Exercise Dashboard
        </h1>

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <SummaryCard title="Total Target Reps" value={totalTarget} />
          <SummaryCard title="Total Completed Reps" value={totalCompleted} />
          <SummaryCard
            title="Overall Progress"
            value={`${((totalCompleted / totalTarget) * 100).toFixed(2)}%`}
          />
          <SummaryCard
            title="Average Accuracy"
            value={`${avgAccuracy.toFixed(2)}%`}
          />
          <SummaryCard
            title="Avg Session Duration"
            value={`${avgDuration.toFixed(1)} sec`}
          />
          <SummaryCard
            title="Peak Max Angle"
            value={`${peakMaxAngle}°`}
          />
        </div>

        {/* ROW 1: Reps + ROM */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <ChartCard title="Target vs Completed Reps">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="targetReps" stroke="#8884d8" name="Target Reps" />
                <Line type="monotone" dataKey="completedReps" stroke="#82ca9d" name="Completed Reps" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Range of Motion Angles">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgAngle" stroke="#2563eb" name="Avg Angle" />
                <Line type="monotone" dataKey="maxAngle" stroke="#16a34a" name="Max Angle" />
                <Line type="monotone" dataKey="minAngle" stroke="#dc2626" name="Min Angle" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ROW 2: Accuracy + Duration */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <ChartCard title="Form Accuracy (%) per Session)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#22c55e" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Session Duration (sec)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#f59e0b" name="Duration" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ROW 3: Correct Frames */}
        <ChartCard title="Correct Form Frames (Daily & Cumulative)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="correctFrames" stroke="#10b981" name="Daily Correct Frames" />
              <Line type="monotone" dataKey="cumulativeCorrectFrames" stroke="#3b82f6" name="Cumulative Correct Frames" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </main>
    </div>
  );
}

// --- helper components ----
function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "16px 18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "16px 18px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {title}
      </div>
      <div style={{ width: "100%", height: "260px" }}>{children}</div>
    </div>
  );
}
