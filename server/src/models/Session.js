import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    exerciseName: { type: String, default: "Bicep Curl" },

    targetReps: Number,
    completedReps: Number,

    avgAngle: Number,
    maxAngle: Number,
    minAngle: Number,
    totalFrames: Number,
    correctFormFrames: Number,
    accuracy: Number,

    durationSeconds: Number,

    llmNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
