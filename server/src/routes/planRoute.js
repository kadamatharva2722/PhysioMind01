// server/src/routes/planRoute.js
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import ExercisePlan from "../models/ExercisePlan.js";
import { generateTodayPlan } from "../services/planService.js"; // where your Groq code lives
import dayjs from "dayjs";

const router = express.Router();

router.get("/today", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const force = req.query.force === "1";

    // start of today
    const startOfToday = dayjs().startOf("day").toDate();

    let planDoc = null;

    // If not forcing, try to reuse today's plan
    if (!force) {
      planDoc = await ExercisePlan.findOne({
        userId,
        createdAt: { $gte: startOfToday },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // If no plan found or force regenerate → call LLM
    if (!planDoc || force) {
      const newPlan = await generateTodayPlan(userId);
      planDoc = newPlan.toObject ? newPlan.toObject() : newPlan;
    }

    // Normalize response shape: { exercises: [...] }
    const exercises = planDoc.exercises || [];
    return res.json({ exercises });

  } catch (err) {
    console.error("Plan route error:", err);
    return res.status(500).json({ error: "Unable to generate plan" });
  }
});

export default router;
