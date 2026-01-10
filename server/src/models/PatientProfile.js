import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    age: Number,
    gender: String,
    affectedArea: String,

    primaryComplaint: String,
    painDuration: String,
    painLevel: Number,
    painPattern: [String],

    wristIssueType: String,
    wristLimitations: [String],

    movementLimitations: [String],
    limitations: [String],      // ✅ ADDED

    injuryCause: String,
    onset: String,              // ✅ ADDED

    previousSurgeries: String,
    medicalConditions: String,
    medications: String,

    exerciseExperience: String,

    goals: [String],
    customGoal: String,

    diagnosis: String,
    painArea: String,
    history: String             // ✅ ADDED
  },
  { timestamps: true }
);

export default mongoose.model("PatientProfile", patientProfileSchema);
