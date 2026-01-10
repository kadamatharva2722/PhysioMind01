import mongoose from "mongoose";

const exercisePlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },

    // Raw JSON string from LLM (for debugging / re-generation)
    planText: String,

    exercises: [
      {
        name: String,        // "Bicep Curl"
        targetReps: Number,  // 10
        sets: Number,        // 3
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ExercisePlan", exercisePlanSchema);
