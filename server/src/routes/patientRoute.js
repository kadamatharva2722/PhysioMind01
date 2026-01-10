import express from "express";
import PatientProfile from "../models/PatientProfile.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save / update intake form
router.post("/intake", requireAuth, async (req, res) => {
  try {
    const data = req.body;

    // Merge limitations properly before saving
    const mergedLimitations =
      data.affectedArea === "Wrist / Hand"
        ? data.wristLimitations || []
        : data.movementLimitations || [];

    const profileData = {
      userId: req.userId,

      age: data.age,
      gender: data.gender,

      affectedArea: data.affectedArea,
      primaryComplaint: data.primaryComplaint,

      painDuration: data.painDuration,
      painLevel: Number(data.painLevel ?? 0),
      painPattern: data.painPattern || [],

      movementLimitations: data.movementLimitations || [],
      wristLimitations: data.wristLimitations || [],
      limitations: mergedLimitations,

      wristIssueType: data.wristIssueType || "",
      injuryCause: data.injuryCause || "",

      previousSurgeries: data.previousSurgeries || "",
      medicalConditions: data.medicalConditions || "",
      medications: data.medications || "",

      exerciseExperience: data.exerciseExperience || "",
      goals: data.goals || [],

      // optional classic fields
      diagnosis: data.diagnosis || "",
      painArea: data.painArea || data.affectedArea || "",
    };

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.userId },
      profileData,
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    console.error("Intake save error:", err);
    res.status(500).json({ error: "Unable to save intake" });
  }
});

// Get current user's intake data
router.get("/intake", requireAuth, async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.userId });
    res.json({ profile });
  } catch (err) {
    console.error("Intake fetch error:", err);
    res.status(500).json({ error: "Unable to fetch intake" });
  }
});

export default router;
