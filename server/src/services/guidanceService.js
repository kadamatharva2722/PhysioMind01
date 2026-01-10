// server/src/services/guidanceService.js
import Groq from "groq-sdk";
import { logLLM } from "../logger/llmlogger.js";

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function getGuidanceFromLLM({ reps, stage, angle, warning, event }) {
  // 1) User stopped moving → one fixed line
  if (event === "stopped") {
    return "Please continue.";
  }

  // 2) Normal movement → no LLM, just count + position
  if (event === "none") {
    return `Rep ${reps} — ${stage}.`;
  }

  // 3) Only for rep_completed / form_warning we call LLM
  const userPrompt = `
Exercise: Bicep Curl
Reps: ${reps}
Stage: ${stage}
Angle: ${angle}
Warning: ${warning}
Event: ${event}

Rules:
- If rep_completed → short praise + next movement tip
- If form_warning → tiny correction
- Max 15–20 words
- Physiotherapy tone, one sentence only
`;

  if (!groq) {
    const fallback =
      event === "rep_completed"
        ? `Good rep ${reps}.`
        : warning !== "none"
        ? warning
        : `Rep ${reps}.`;

    logLLM(event, userPrompt, fallback);
    return fallback;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Short, clinical physiotherapy instructions only." },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 40,
      temperature: 0.2,
    });

    const output = completion.choices[0].message.content.trim();
    logLLM(event, userPrompt, output);
    return output;
  } catch (err) {
    console.error("LLM ERROR:", err);
    const fallback =
      warning !== "none" ? warning : `Rep ${reps} done.`;
    logLLM(event, userPrompt, `ERROR → ${fallback}`);
    return fallback;
  }
}
