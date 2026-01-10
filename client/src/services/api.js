import axios from "axios";

const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3000";
export const API_URL = `${API_BASE.replace(/\/$/, "")}/api`;

// ---------- Helpers ----------

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------- Exercise / session ----------

export async function analyzeFrame(imageBase64) {
  const res = await axios.post(
    `${API_URL}/analyze`,
    { image: imageBase64 },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function startSessionAPI(targetReps) {
  const res = await axios.post(
    `${API_URL}/session/start`,
    {
      targetReps: Number(targetReps) || 10,
      exerciseName: "Bicep Curl"
    },
    { headers: authHeaders() }
  );
  return res.data;
}


export async function endSessionAPI() {
  const res = await axios.post(
    `${API_URL}/session/end`,
    { llmNotes: "" },
    { headers: authHeaders() }
  );
  return res.data;
}

// ---------- Auth ----------

export async function loginAPI({ email, password }) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
}

export async function signupAPI({ name, email, password }) {
  const res = await axios.post(`${API_URL}/auth/signup`, {
    name,
    email,
    password,
  });
  return res.data;
}

// ---------- Patient intake ----------

export async function savePatientInfoAPI(data) {
  try {
    const res = await axios.post(`${API_URL}/patient/intake`, data, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error(
      "savePatientInfoAPI error:",
      err.response?.status,
      err.response?.data || err.message
    );
    throw err;
  }
}

// ---------- Dashboard summary (REAL, uses DB) ----------

function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function calcDayStreak(sessions) {
  // unique date strings: "YYYY-MM-DD"
  const dateSet = new Set(
    sessions.map((s) =>
      new Date(s.createdAt).toISOString().slice(0, 10)
    )
  );

  let streak = 0;
  const today = new Date();
  while (true) {
    const d = new Date(today);
    d.setDate(today.getDate() - streak);
    const key = d.toISOString().slice(0, 10);
    if (dateSet.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Build dashboard summary using:
 *  - GET /api/session  (user sessions)
 *  - GET /api/plan/today  (today's LLM plan)
 */
export async function getDashboardSummaryAPI() {
  const headers = authHeaders();

  const [sessionsRes, planRes] = await Promise.allSettled([
    axios.get(`${API_URL}/session/list`, { headers }),
    axios.get(`${API_URL}/plan/today`, { headers }),
  ]);

  let sessions = [];
  if (sessionsRes.status === "fulfilled") {
    sessions = sessionsRes.value.data?.sessions || [];
  }

  // ---- Build "Recent Sessions" array for UI ----
  const recentSessions = sessions.slice(0, 5).map((s) => ({
    exercise: s.exerciseName || "Bicep Curl",
    reps: `${s.completedReps}/${s.targetReps}`,
    accuracy:
      typeof s.accuracy === "number" ? `${s.accuracy}%` : s.accuracy || "N/A",
    duration: `${Math.round((s.durationSeconds || 0) / 60) || 1} min`,
    date: formatDateLabel(s.createdAt),
  }));

  // ---- Day streak from sessions ----
  const dayStreak = calcDayStreak(sessions);

  // ---- Today goal from plan + latest session ----
  let todayGoal = {
    exerciseName: "Bicep Curl",
    sets: 1,
    reps: 10,
    targetAccuracy: 95,
    progressPct: 0,
    imageUrl: "/goal-exercise.png",
  };

  if (planRes.status === "fulfilled") {
    const planData = planRes.value.data;

    let exercises = [];
    if (Array.isArray(planData?.exercises)) {
      exercises = planData.exercises;
    } else if (typeof planData?.planText === "string") {
      try {
        const parsed = JSON.parse(planData.planText);
        if (Array.isArray(parsed.exercises)) exercises = parsed.exercises;
      } catch {
        // ignore parse error, keep default
      }
    }

    const first = exercises[0] || {};
    const targetReps =
      first.targetReps ?? first.target ?? todayGoal.reps ?? 10;

    todayGoal = {
      ...todayGoal,
      exerciseName: first.name || todayGoal.exerciseName,
      sets: first.sets ?? todayGoal.sets,
      reps: targetReps,
    };

    // progress from latest session
    const latest = sessions[0];
    if (latest && targetReps) {
      const pct = Math.round(
        (latest.completedReps / targetReps) * 100
      );
      todayGoal.progressPct = Math.max(0, Math.min(100, pct));
    }
  }

  return {
    todayGoal,
    stats: {
      dayStreak,
      achievements: 0, // you can wire this later if needed
      dailyScore: todayGoal.progressPct,
    },
    recentSessions,
  };
}

// ---------- Plan & history ----------

export async function getPlanAPI() {
  const res = await axios.get(`${API_URL}/plan/today`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getHistoryAPI() {
  try {
    const res = await axios.get(`${API_URL}/session/list`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return { history: [] };
    }
    throw err;
  }
}

/**
 * Generate today's plan using LLM.
 * If you want a fresh plan every click, call with { force: true }.
 */
export async function generateTodayPlanAPI({ force = true } = {}) {
  const query = force ? "?force=1" : "";
  const res = await axios.get(`${API_URL}/plan/today${query}`, {
    headers: authHeaders(),
  });
  return res.data;
}

// ---------- Default export (optional) ----------

export default {
  analyzeFrame,
  startSessionAPI,
  endSessionAPI,
  loginAPI,
  signupAPI,
  savePatientInfoAPI,
  getDashboardSummaryAPI,
  getPlanAPI,
  getHistoryAPI,
  generateTodayPlanAPI,
};
 