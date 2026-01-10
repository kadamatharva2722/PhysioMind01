// server/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Optional physio-related meta
    age: Number,
    gender: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
