// client/src/pages/IntakeFormPage.jsx
import React, { useState } from "react";
import { savePatientInfoAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";
import "../styles/frontend.css";
import "../styles/patient.css";

// ✅ Map emoji pain levels → backend numeric values
const PAIN_MAP = {
  Minimal: 1,
  Low: 3,
  Intermediate: 5,
  High: 8,
  Extreme: 10,
};

const PatientForm = () => {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    affectedArea: "",
    primaryComplaint: "",
    painDuration: "",
    painLevel: "Intermediate", // ✅ default label
    painPattern: [],
    movementLimitations: [],

    wristIssueType: "",
    wristLimitations: [],

    injuryCause: "",
    previousSurgeries: "",
    medicalConditions: "",
    medications: "",
    exerciseExperience: "",

    goals: [],
    customGoal: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckbox = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("");

  const numericPain = Number(PAIN_MAP[form.painLevel]);

  if (!numericPain) {
    alert("Pain level not selected");
    return;
  }

  const finalPayload = {
    ...form,
    painLevel: numericPain,   // ✅ ALWAYS NUMBER

    limitations:
      form.affectedArea === "Wrist / Hand"
        ? form.wristLimitations
        : form.movementLimitations,

    goals: [...form.goals, form.customGoal].filter(Boolean),
  };

  console.log("✅ Sending payload:", finalPayload);

  try {
    await savePatientInfoAPI(finalPayload);
    setStatus("✅ Saved successfully.");
  } catch (err) {
    console.error(err);
    setStatus("❌ Unable to save. Check server.");
  }
};

  return (
    <div className="dash-root">
      <Sidebar />

      <main className="dash-main">
        <div className="page-card patient-card">
          <h2 className="section-title">Patient Intake Form</h2>
          <p className="section-subtitle">
            Helps AI personalize your rehab plan.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            {/* BASIC INFO */}
            <div className="form-row">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={form.age} onChange={handleChange("age")} />
            </div>

            <div className="form-row">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={handleChange("gender")}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            {/* BODY AREA */}
            <div className="form-row">
              <label className="form-label">Affected Area</label>
              <select className="form-select" value={form.affectedArea} onChange={handleChange("affectedArea")}>
                <option value="">Select</option>
                <option>Wrist / Hand</option>
                <option>Forearm</option>
                <option>Elbow</option>
                <option>Shoulder</option>
                <option>Neck</option>
                <option>Back</option>
                <option>Knee</option>
                <option>Ankle / Foot</option>
                <option>Other</option>
              </select>
            </div>

            {/* COMPLAINT */}
            <div className="form-row full-width">
              <label className="form-label">Primary Complaint</label>
              <textarea className="form-textarea" value={form.primaryComplaint} onChange={handleChange("primaryComplaint")} />
            </div>

            {/* PAIN EMOJI SCALE */}
            <div className="form-row full-width">
              <label className="form-label">Pain Level</label>

              <div className="pain-scale">
                {[
                  { label: "Minimal", emoji: "😊" },
                  { label: "Low", emoji: "🙂" },
                  { label: "Intermediate", emoji: "😐" },
                  { label: "High", emoji: "😣" },
                  { label: "Extreme", emoji: "😫" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`pain-btn ${form.painLevel === item.label ? "active" : ""}`}
                    onClick={() => setForm((prev) => ({ ...prev, painLevel: item.label }))}
                  >
                    <div className="pain-emoji">{item.emoji}</div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PAIN PATTERN */}
            <div className="form-row full-width">
              <label className="form-label">Pain Pattern</label>
              <div className="checkbox-group">
                {["Constant","During movement","With lifting","Morning stiffness","Night pain"].map((label) => (
                  <label key={label} className="checkbox-item">
                    <input type="checkbox" checked={form.painPattern.includes(label)} onChange={() => handleCheckbox("painPattern", label)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* LIMITATIONS */}
            <div className="form-row full-width">
              <label className="form-label">Movement Limitations</label>
              <div className="checkbox-group">
                {["Pain during movement","Weakness","Limited ROM","Clicking","Instability"].map((label) => (
                  <label key={label} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.movementLimitations.includes(label)}
                      onChange={() => handleCheckbox("movementLimitations", label)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* GOALS */}
            <div className="form-row full-width">
              <label className="form-label">Goals</label>
              <div className="checkbox-group">
                {["Improve grip strength","Reduce pain","Increase range of motion","Return to sport"].map((label) => (
                  <label key={label} className="checkbox-item">
                    <input type="checkbox" checked={form.goals.includes(label)} onChange={() => handleCheckbox("goals", label)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row full-width">
              <input className="form-input" placeholder="Other goal" value={form.customGoal} onChange={handleChange("customGoal")} />
            </div>

            {/* SUBMIT */}
            <div className="form-row full-width">
              <button className="btn-primary" type="submit">
                Save Form
              </button>
            </div>

            {status && (
              <p className="text-muted" style={{ marginTop: "0.5rem" }}>
                {status}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default PatientForm;
