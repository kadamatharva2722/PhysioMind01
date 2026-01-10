// server/src/routes/analyzeRoutes.js
import express from "express";
import {
  analyzeFrame,
  startSession,
  endSession,
  getUserSessions,
} from "../controllers/analyzeController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// FRAME ANALYSIS
router.post(
  "/analyze",
  express.json({ limit: "20mb" }),
  authMiddleware,
  analyzeFrame
);

// START SESSION
router.post(
  "/session/start",
  express.json(),
  authMiddleware,
  startSession
);

// END SESSION (manual)
router.post(
  "/session/end",
  express.json(),
  authMiddleware,
  endSession
);

// USER HISTORY
router.get(
  "/session/list",
  authMiddleware,
  getUserSessions
);

export default router;
