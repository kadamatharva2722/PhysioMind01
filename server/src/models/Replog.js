import mongoose from "mongoose";

const repLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "anonymous", // later connect with auth
    },
    count: {
      type: Number,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    feedback: {
      type: String,
    },
    rawAngle: {
      type: Number,
    },
    stage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RepLog", repLogSchema);
