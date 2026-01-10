import axios from "axios";

export const sendToPython = async (fileData) => {
  try {
    const res = await axios.post(
      "http://localhost:8000/analyze",
      fileData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (err) {
    console.error("Python server error:", err);
  }
};
