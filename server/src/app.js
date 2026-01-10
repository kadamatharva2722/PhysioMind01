  import express from "express";
  import cors from "cors";
  import { PORT } from "./config.js";

  import analyzeRoute from "./routes/analyzeRoute.js";
  import authRoute from "./routes/authRoute.js";
  import patientRoute from "./routes/patientRoute.js";
  import planRoute from "./routes/planRoute.js";
  import { connectDB } from "./db/connect.js";
  import User from "./models/User.js";
  import bcrypt from "bcryptjs";

  // ---------------------------------------------------
  // 1️⃣ CREATE APP FIRST
  // ---------------------------------------------------
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/", (req, res) => {
    res.json({ message: "Node backend running" });
  });

  app.use("/api/auth", authRoute);

  app.use("/api/patient", patientRoute);

  app.use("/api/plan", planRoute);
  app.use("/api", analyzeRoute);

  // Connect to MongoDB then start server
  connectDB()
    .then(() => {
      console.log("Starting server on port:", PORT);
      // Start server immediately
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Node server listening on 0.0.0.0:${PORT}`);
      });

      server.on('error', (err) => {
        console.error("❌ Server error:", err);
        process.exit(1);
      });

      server.on('listening', () => {
        console.log("📡 Server is now accepting connections");
      });

      // Dev-only: seed test users asynchronously (don't block startup)
      if (process.env.NODE_ENV !== "production") {
        (async () => {
          try {
            const testUsers = [
              { name: "Test User", email: "test@example.com", password: "test" },
              { name: "Sagar", email: "Sagar@gmail.com", password: "12345" },
              { name: "Demo User", email: "demo@example.com", password: "demo123" },
            ];

            for (const testUser of testUsers) {
              try {
                const existing = await User.findOne({ email: testUser.email });
                if (!existing) {
                  const hash = await bcrypt.hash(testUser.password, 10);
                  await User.create({ name: testUser.name, email: testUser.email, passwordHash: hash });
                  console.log(`Seeded test user: ${testUser.email} / ${testUser.password}`);
                }
              } catch (err) {
                console.error(`Error seeding ${testUser.email}:`, err.message);
              }
            }
          } catch (err) {
            console.error("User seeding error:", err);
          }
        })();
      }
    })
    .catch((err) => {
      console.error("Failed to start server due to DB error:", err);
      process.exit(1);
    });
