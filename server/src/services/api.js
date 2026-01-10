// client/src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";

// FRAME ANALYSIS
export async function analyzeFrame(imageBase64) {
  const res = await axios.post(`${API_URL}/analyze`, { image: imageBase64 });
  return res.data;
}

// START SESSION
export async function startSessionAPI() {
  const res = await axios.post(`${API_URL}/session/start`);
  return res.data;
}

// END SESSION
export async function endSessionAPI() {
  const res = await axios.post(`${API_URL}/session/end`);
  return res.data;
}
