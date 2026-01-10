import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  // If no MONGO_URI provided (local dev), don't fail the whole process
  if (!uri) {
    console.warn("⚠️  MONGO_URI not configured — skipping DB connection (dev mode)");
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: "physio_ai" });
    console.log("🔥 MongoDB Connected");
  } catch (err) {
    // In dev we prefer the server to still start — don't exit the process here.
    console.error("❌ MongoDB Connection Error:", err);
    console.warn("Continuing without DB connection (dev fallback)");
  }
}
