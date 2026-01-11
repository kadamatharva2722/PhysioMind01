// client/src/components/WebcamCapture.jsx
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { analyzeFrame, startSessionAPI, endSessionAPI } from "../services/api";
import RepCounterUI from "./RepCounterUI";
import ErrorMessage from "./ErrorMessage";

const FRAME_INTERVAL_MS = 800; // send 1 frame every ~0.8s

const WebcamCapture = ({ targetReps }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState("down");
  const [angle, setAngle] = useState(0);
  const [feedback, setFeedback] = useState("Tracking…");
  const [isValid, setIsValid] = useState(null);
  const [lastGuidance, setLastGuidance] = useState("");
  const [error, setError] = useState("");

  const isProcessingRef = useRef(false);
  const noPoseCountRef = useRef(0);
  const autoEndedRef = useRef(false);

  // voice
  const lastSpokenRef = useRef("");
  const lastVoiceTimeRef = useRef(Date.now());
  const stageRef = useRef("down");
  const repsRef = useRef(0);

  // ---------- TIMER ----------
  useEffect(() => {
    if (!sessionStarted) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionStarted]);

  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ---------- VOICE ----------
  const handleVoiceOutput = (data, count) => {
    const now = Date.now();
    let message = null;

    if (data.warning?.toLowerCase().includes("no_person")) {
      if (now - lastVoiceTimeRef.current > 5000) {
        message = "Please move into the camera frame";
      }
    }

    if (data.event === "rep_completed" && count > repsRef.current) {
      message = `Rep ${count} completed`;
      repsRef.current = count;
    }

    if (data.stage && data.stage !== stageRef.current && data.stage !== "none") {
      message = data.stage;
      stageRef.current = data.stage;
    }

    if (message && message !== lastSpokenRef.current) {
      lastSpokenRef.current = message;
      lastVoiceTimeRef.current = now;
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(message));
    }
  };

  // ---------- END SESSION ----------
  const handleEnd = async () => {
    if (autoEndedRef.current) return;
    autoEndedRef.current = true;

    try {
      await endSessionAPI();
    } catch (e) {
      console.warn("endSessionAPI failed:", e);
    }

    setSessionStarted(false);
  };

  // ---------- MAIN ANALYSIS LOOP ----------
  useEffect(() => {
    if (!sessionStarted) return;

    const interval = setInterval(async () => {
      if (!webcamRef.current || isProcessingRef.current) return;

      const sourceCanvas = webcamRef.current.getCanvas();
      if (!sourceCanvas) return;

      // resize & compress frame
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 640;
      tempCanvas.height = 480;
      const ctx = tempCanvas.getContext("2d");
      ctx.drawImage(sourceCanvas, 0, 0, 640, 480);

      const imageBase64 = tempCanvas.toDataURL("image/jpeg", 0.6);

      try {
        isProcessingRef.current = true;

        const data = await analyzeFrame(imageBase64);
        if (!data) return;

        const newReps =
          typeof data.reps === "number"
            ? data.reps
            : typeof data.count === "number"
            ? data.count
            : reps;

        setReps(newReps);
        setStage(data.stage ?? "none");
        setAngle(data.angle ?? 0);
        setLastGuidance(data.guidance ?? "");
        setError("");

        if (data.warning?.toLowerCase().includes("no_person")) {
          noPoseCountRef.current += 1;

          if (noPoseCountRef.current > 2) {
            setFeedback("Please stand fully in the camera frame");
            setIsValid(false);
          }
          return;
        }

        noPoseCountRef.current = 0;
        setFeedback(data.feedback ?? "Tracking…");
        setIsValid(true);

        if (Array.isArray(data.landmarks) && canvasRef.current) {
          drawSkeleton(data.landmarks, canvasRef.current);
        } else if (canvasRef.current) {
          const c = canvasRef.current.getContext("2d");
          c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        handleVoiceOutput(data, newReps);

        const tReps = Number(targetReps);
        if (tReps > 0 && newReps >= tReps && !autoEndedRef.current) {
          const msg = `Great job! You completed ${tReps} reps.`;
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
          await handleEnd();
        }
      } catch (err) {
        console.error("Analyze error:", err);
        setError("Server busy, retrying…");
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [sessionStarted, targetReps]);

  // ---------- START ----------
  const handleStart = async () => {
    try {
      await startSessionAPI(targetReps);
    } catch (e) {
      console.warn("startSessionAPI failed:", e);
    }

    setSeconds(0);
    setReps(0);
    repsRef.current = 0;
    setStage("down");
    stageRef.current = "down";
    autoEndedRef.current = false;
    setSessionStarted(true);
  };

  // ---------- RENDER ----------
  return (
    <div className="live-shell">
      <div className="live-left">
        <div className={`live-video-wrapper ${!sessionStarted ? "dim" : ""}`}>
          <div className={`live-badge ${sessionStarted ? "active" : ""}`}>
            <span className="live-badge-dot" /> LIVE
          </div>

          <div className="live-time-label">Time: {formatTime()}</div>

          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 640,
              height: 480,
              frameRate: { ideal: 15, max: 15 },
            }}
            className="live-video-feed"
          />

          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="live-video-overlay"
          />

          {!sessionStarted && (
            <button className="live-start-btn" onClick={handleStart}>
              ▶ Start Session
            </button>
          )}
        </div>

        {sessionStarted && (
          <button className="live-end-btn" onClick={handleEnd}>
            End Session
          </button>
        )}
      </div>

      <div className="live-right">
        <RepCounterUI
          reps={reps}
          stage={stage}
          angle={angle}
          feedback={feedback}
          isValid={isValid}
          targetReps={targetReps}
        />

        {lastGuidance && (
          <div className="live-coach-box">
            <strong>Coach:</strong> {lastGuidance}
          </div>
        )}

        <ErrorMessage message={error} />
      </div>
    </div>
  );
};

// ---------- SKELETON ----------
const drawSkeleton = (landmarks, canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.fillStyle = "#00ff7b";
  landmarks.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.strokeStyle = "#00ff7b";
  ctx.lineWidth = 3;

  const connections = [
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],
  ];

  connections.forEach(([a, b]) => {
    if (landmarks[a] && landmarks[b]) {
      ctx.beginPath();
      ctx.moveTo(
        landmarks[a].x * canvas.width,
        landmarks[a].y * canvas.height
      );
      ctx.lineTo(
        landmarks[b].x * canvas.width,
        landmarks[b].y * canvas.height
      );
      ctx.stroke();
    }
  });

  ctx.restore();
};

export default WebcamCapture;
