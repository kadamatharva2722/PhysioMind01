// client/src/pages/IntakeFormPage.jsx
import React, { useState } from "react";
import { savePatientInfoAPI } from "../services/api";
import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";
import "../styles/frontend.css";
import "../styles/patient.css";

// 🔹 Map emoji labels -> numeric pain levels expected by backend (Number)
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
    // store label here, NOT number
    painLevel: "Intermediate",
    painPattern: [],
    movementLimitations: [],

    // Wrist-specific
    wristIssueType: "",
    wristLimitations: [],

    // Medical background
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

    // ✅ convert painLevel label -> number
    const numericPain = PAIN_MAP[form.painLevel];
    // ✅ convert age string -> number or leave null
    const numericAge =
      form.age !== "" && form.age !== null ? Number(form.age) : null;

    if (!numericPain) {
      alert("Please select a pain level.");
      return;
    }

    const finalPayload = {
      ...form,
      age: numericAge,          // Number | null (valid for schema)
      painLevel: numericPain,   // Number 1–10, matches schema

      // backend also has movement/wristLimitations fields, this stays:
      limitations:
        form.affectedArea === "Wrist / Hand"
          ? form.wristLimitations
          : form.movementLimitations,

      goals: [...form.goals, form.customGoal].filter(Boolean),
    };

    console.log("🚀 Sending intake payload to backend:", finalPayload);

    try {
      await savePatientInfoAPI(finalPayload);
      setStatus("✅ Saved successfully.");
    } catch (err) {
      console.error("❌ Intake save error (frontend):", err);
      setStatus("❌ Unable to save. Check server.");
    }
  };

  return (
    <div className="dash-root">
      {/* Shared sidebar (same as Dashboard) */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="dash-main">
        <div className="page-card patient-card">
          <h2 className="section-title">Patient Intake Form</h2>
          <p className="section-subtitle">
            Helps AI personalize your rehab plan.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            {/* --------------------- BASIC INFO --------------------- */}
            <div className="form-row">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                value={form.age}
                onChange={handleChange("age")}
                min="0"
              />
            </div>

            <div className="form-row">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={handleChange("gender")}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            {/* --------------------- BODY AREA --------------------- */}
            <div className="form-row">
              <label className="form-label">Affected Area</label>
              <select
                className="form-select"
                value={form.affectedArea}
                onChange={handleChange("affectedArea")}
              >
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

            {/* --------------------- PRIMARY COMPLAINT --------------------- */}
            <div className="form-row full-width">
              <label className="form-label">Primary Complaint</label>
              <textarea
                className="form-textarea"
                value={form.primaryComplaint}
                onChange={handleChange("primaryComplaint")}
                placeholder="e.g. wrist fracture post-surgery stiffness"
              />
            </div>

            {/* ---------------- PAIN LEVEL (EMOJI SCALE) ---------------- */}
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
                    className={`pain-btn ${
                      form.painLevel === item.label ? "active" : ""
                    }`}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        painLevel: item.label,
                      }))
                    }
                  >
                    <div className="pain-emoji">{item.emoji}</div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* --------------------- PAIN PATTERN --------------------- */}
            <div className="form-row full-width">
              <label className="form-label">Pain Pattern</label>

              <div className="checkbox-group">
                {[
                  "Constant",
                  "During movement",
                  "With lifting",
                  "Morning stiffness",
                  "Night pain",
                ].map((label) => (
                  <label key={label} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.painPattern.includes(label)}
                      onChange={() => handleCheckbox("painPattern", label)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* ------------------- WRIST-SPECIFIC ------------------- */}
            {form.affectedArea === "Wrist / Hand" && (
              <>
                <div className="form-row full-width">
                  <h3 className="section-title small-title">
                    Wrist / Hand Details
                  </h3>
                </div>

                <div className="form-row">
                  <label className="form-label">Injury Type</label>
                  <select
                    className="form-select"
                    value={form.wristIssueType}
                    onChange={handleChange("wristIssueType")}
                  >
                    <option value="">Select</option>
                    <option>Post-surgery recovery</option>
                    <option>Fracture (radius/ulna)</option>
                    <option>Tendon injury</option>
                    <option>Ligament strain (TFCC)</option>
                    <option>Nerve involvement</option>
                    <option>Overuse strain</option>
                  </select>
                </div>

                <div className="form-row full-width">
                  <label className="form-label">
                    Wrist Movement Limitations
                  </label>
                  <div className="checkbox-group">
                    {[
                      "Difficulty gripping",
                      "Pain during flexion",
                      "Pain during extension",
                      "Pain during rotation",
                      "Weak grip strength",
                      "Pain while lifting",
                      "Stiffness",
                      "Swelling",
                    ].map((label) => (
                      <label key={label} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.wristLimitations.includes(label)}
                          onChange={() =>
                            handleCheckbox("wristLimitations", label)
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ------------------ GENERAL LIMITATIONS ------------------ */}
            {form.affectedArea !== "Wrist / Hand" && (
              <div className="form-row full-width">
                <label className="form-label">Movement Limitations</label>
                <div className="checkbox-group">
                  {[
                    "Pain during movement",
                    "Weakness",
                    "Limited ROM",
                    "Clicking",
                    "Instability",
                  ].map((label) => (
                    <label key={label} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.movementLimitations.includes(label)}
                        onChange={() =>
                          handleCheckbox("movementLimitations", label)
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* --------------------- INJURY CONTEXT --------------------- */}
            <div className="form-row">
              <label className="form-label">Cause of Injury</label>
              <select
                className="form-select"
                value={form.injuryCause}
                onChange={handleChange("injuryCause")}
              >
                <option value="">Select</option>
                <option>Sports injury</option>
                <option>Fall / trauma</option>
                <option>Post-surgery</option>
                <option>Overuse / repetitive stress</option>
                <option>No clear cause</option>
              </select>
            </div>

            {/* --------------------- MEDICAL BACKGROUND --------------------- */}
            <div className="form-row">
              <label className="form-label">
                Previous Surgeries / Injuries
              </label>
              <textarea
                className="form-textarea"
                value={form.previousSurgeries}
                onChange={handleChange("previousSurgeries")}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Other Medical Conditions</label>
              <textarea
                className="form-textarea"
                value={form.medicalConditions}
                onChange={handleChange("medicalConditions")}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Medications (optional)</label>
              <input
                className="form-input"
                value={form.medications}
                onChange={handleChange("medications")}
              />
            </div>

            <div className="form-row">
              <label className="form-label">Exercise Experience</label>
              <select
                className="form-select"
                value={form.exerciseExperience}
                onChange={handleChange("exerciseExperience")}
              >
                <option value="">Select</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Athlete</option>
              </select>
            </div>

            {/* --------------------- GOALS --------------------- */}
            <div className="form-row full-width">
              <label className="form-label">Rehab Goals</label>
              <div className="checkbox-group">
                {[
                  "Improve grip strength",
                  "Reduce pain",
                  "Increase range of motion",
                  "Lift objects without pain",
                  "Return to sport",
                  "Prevent re-injury",
                ].map((label) => (
                  <label key={label} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.goals.includes(label)}
                      onChange={() => handleCheckbox("goals", label)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row full-width">
              <input
                className="form-input"
                placeholder="Other goal"
                value={form.customGoal}
                onChange={handleChange("customGoal")}
              />
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
