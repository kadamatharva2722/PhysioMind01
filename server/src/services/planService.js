import Groq from "groq-sdk";
import Session from "../models/Session.js";
import PatientProfile from "../models/PatientProfile.js";
import ExercisePlan from "../models/ExercisePlan.js";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function generateTodayPlan(userId) {
  const profile = await PatientProfile.findOne({ userId }).lean();
  const recentSessions = await Session.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const profileText = profile
    ? `
Age: ${profile.age || "NA"}
Gender: ${profile.gender || "NA"}
AffectedArea: ${profile.affectedArea || "NA"}
PrimaryComplaint: ${profile.primaryComplaint || "NA"}
PainDuration: ${profile.painDuration || "NA"}
PainLevel: ${profile.painLevel ?? "NA"}
PainPattern: ${(profile.painPattern || []).join(", ") || "NA"}
InjuryCause: ${profile.injuryCause || "NA"}
WristIssueType: ${profile.wristIssueType || "NA"}
Limitations: ${(profile.limitations || []).join(", ") || "NA"}
Goals: ${(profile.goals || []).join(", ") || "NA"}
PreviousSurgeries: ${profile.previousSurgeries || "NA"}
MedicalConditions: ${profile.medicalConditions || "NA"}
Medications: ${profile.medications || "NA"}
ExerciseExperience: ${profile.exerciseExperience || "NA"}
`
    : "No profile data.";

  const sessionsText =
    recentSessions.length === 0
      ? "No previous sessions."
      : recentSessions
          .map(
            (s) =>
              `Date: ${s.createdAt?.toISOString() || "NA"}, Exercise: ${
                s.exerciseName || "Bicep Curl"
              }, Reps: ${s.completedReps}/${s.targetReps}, Accuracy: ${
                s.accuracy
              }%, Duration: ${s.durationSeconds}s`
          )
          .join("\n");

  const userPrompt = `
You are a physiotherapy planner focusing on wrist fracture rehab using mainly BICEP CURL as prototype.

PATIENT PROFILE:
${profileText}

RECENT SESSIONS:
${sessionsText}

RULES:
- Use only "Bicep Curl" for now.
- Keep the volume safe and progressive.
- For DAY 1: base only on patient profile.
- For later days: also consider previous sessions (fatigue, accuracy, progress).

TASK:
Design a simple plan for TODAY.
Return JSON ONLY in this format (no extra text):

{
  "exercises": [
    { "name": "Bicep Curl", "targetReps": 20, "sets": 2 }
  ]
}
`;

  // Default fallback plan
  let jsonPlan = { exercises: [{ name: "Bicep Curl", targetReps: 10, sets: 1 }] };

  if (groq) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a physiotherapy planner. Output valid JSON only." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    try {
      const text = completion.choices[0].message.content.trim();
      jsonPlan = JSON.parse(text);
    } catch {
      // fallback to default
    }
  }

  const planDoc = await ExercisePlan.create({
    userId,
    planText: JSON.stringify(jsonPlan),
    exercises: jsonPlan.exercises,
  });

  return planDoc;
}
