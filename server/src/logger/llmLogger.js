import fs from "fs";
import path from "path";

const logPath = path.join(process.cwd(), "llm_logs.txt");

export function logLLM(eventType, prompt, output) {
  const time = new Date().toISOString();
  const logEntry = `
-----------------------------
TIME: ${time}
EVENT: ${eventType}

>> LLM INPUT:
${prompt}

>> LLM OUTPUT:
${output}

-----------------------------
`;

  fs.appendFileSync(logPath, logEntry, "utf8");
}
