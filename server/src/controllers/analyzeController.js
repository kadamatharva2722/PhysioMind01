// server/src/controllers/analyzeController.js
import axios from "axios";
import { PYTHON_SERVICE_URL } from "../config.js";
import Session from "../models/Session.js";
import SessionEvaluator from "../utils/SessionEvaluator.js";

const evaluators = new Map();

function getEvaluator(userId) {
  if (!evaluators.has(userId)) {
    evaluators.set(userId, new SessionEvaluator(10));
  }
  return evaluators.get(userId);
}

function normalizePythonAnalysis(analysis = {}) {
  return {
    reps: Number(analysis.count ?? 0),
    stage: analysis.stage ?? "none",
    angle: Number(analysis.angle ?? 0),
    guidance: analysis.guidance ?? analysis.feedback ?? "",
    warning: analysis.warning ?? "",
    event: analysis.event ?? null,
    raw: analysis,
  };
}

// Simple circuit-breaker state for the Python service
let pyFailureCount = 0;
const PY_FAILURE_THRESHOLD = 6;
let pyCooldownUntil = 0; // timestamp in ms
const PY_COOLDOWN_MS = 10_000;

/** ===============================
 * ANALYZE FRAME (PER USER SESSION)
 * =============================== */
export const analyzeFrame = async (req, res) => {
  try {
    const userId = req.userId;
    const evaluator = getEvaluator(userId);

    if (!PYTHON_SERVICE_URL) {
      console.warn("analyzeFrame: PYTHON_SERVICE_URL not set");
      return res.status(503).json({ error: "python_unavailable" });
    }

    if (Date.now() < pyCooldownUntil) {
      return res.status(503).json({ error: "python_cooldown" });
    }

    const pyUrl = PYTHON_SERVICE_URL.replace(/\/$/, "") + "/analyze";

    if (!req.body?.image) {
      return res.status(400).json({ error: "missing_image" });
    }

    const pyRes = await axios.post(
      pyUrl,
      { image: req.body.image },
      { timeout: 10000 }
    );

    const norm = normalizePythonAnalysis(pyRes.data);
    evaluator.processFrame(norm.angle, norm.stage, norm.reps);
    if (norm.reps >= evaluator.targetReps) {
      return res.json({
        done: true,
        reps: norm.reps,
        message: "Target completed"
      });
    }

    pyFailureCount = 0;

    return res.json({
      reps: norm.reps,    // ★ always send reps
      count: norm.reps,   // ★ backward compatibility
      stage: norm.stage,
      angle: norm.angle,
      guidance: norm.guidance,
      warning: norm.warning,
      event: norm.event,
      stats: {
        completedReps: evaluator.completedReps,
        totalFrames: evaluator.totalFrames,
      },
    });

  } catch (err) {
    const code = err.code || (err.response && err.response.status) || "unknown";
    console.error("Analyze error:", {
      message: err.message,
      code,
      responseData: err.response?.data,
    });

    pyFailureCount += 1;
    if (pyFailureCount >= PY_FAILURE_THRESHOLD) {
      pyCooldownUntil = Date.now() + PY_COOLDOWN_MS;
      console.warn(
        `Python service entering cooldown for ${PY_COOLDOWN_MS}ms`
      );
      pyFailureCount = 0;
    }

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(502).json({ error: "python_unreachable" });
    }

    if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
      return res.status(504).json({ error: "python_timeout" });
    }

    return res.status(502).json({ error: "python_error" });
  }
};

/** ========================
 * START SESSION PER-USER
 * ======================== */
export const startSession = async (req, res) => {
  try {
    const { targetReps, exerciseName } = req.body;
    const userId = req.userId;

    const evaluator = getEvaluator(userId);

    // RESET NODE-SIDE STATE
    evaluator.startSession({
      userId,
      exerciseName,
      targetReps,
    });

    // RESET PYTHON MODEL TOO
    if (PYTHON_SERVICE_URL) {
      await axios.post(`${PYTHON_SERVICE_URL}/reset`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("startSession error:", err);
    return res.status(500).json({ error: "Unable to start session" });
  }
};

/** ======================
 * END SESSION PER-USER
 * ====================== */
export const endSession = async (req, res) => {
  try {
    const userId = req.userId;
    const evaluator = getEvaluator(userId);

    const completed = evaluator.completedReps || 0;
    const target = evaluator.targetReps || 0;

    const accuracy = target > 0 ? Math.round((completed / target) * 100) : 0;

    const data = evaluator.getSessionData();

    const saved = await Session.create({
      userId,
      exerciseName: evaluator.exerciseName,
      targetReps: target,
      completedReps: completed,
      durationSeconds: data.durationSeconds,
      avgAngle: data.avgAngle,
      maxAngle: data.maxAngle,
      minAngle: data.minAngle,
      totalFrames: data.totalFrames,
      correctFormFrames: data.correctFormFrames,
      accuracy,
    });

    evaluator.reset();

    return res.json({ success: true, saved });
  } catch (err) {
    console.error("endSession error:", err);
    return res.status(500).json({ error: "Unable to end session" });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const userId = req.userId;

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ sessions });
  } catch (err) {
    console.error("getUserSessions error:", err);
    return res.status(500).json({ error: "Unable to get sessions" });
  }
};
