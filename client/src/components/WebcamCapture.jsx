// client/src/components/WebcamCapture.jsx
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { analyzeFrame, startSessionAPI, endSessionAPI } from "../services/api";
import RepCounterUI from "./RepCounterUI";
import ErrorMessage from "./ErrorMessage";

const TARGET_FPS = 60;
const TARGET_INTERVAL_MS = 300 / TARGET_FPS; // ~16.67ms

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
  const lastCaptureRef = useRef(0);
  const rafRef = useRef(null);

  // for voice
  const lastSpokenRef = useRef("");
  const stageRef = useRef("down");
  const repsRef = useRef(0);
  const lastVoiceTimeRef = useRef(Date.now());

  // to avoid ending session multiple times
  const autoEndedRef = useRef(false);

  // ----- TIMER -----
  useEffect(() => {
    let timer = null;
    if (sessionStarted) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => timer && clearInterval(timer);
  }, [sessionStarted]);

  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ----- VOICE COACHING -----
  const handleVoiceOutput = (data, effectiveReps) => {
    const now = Date.now();
    let message = null;

    if (data.warning && data.warning.toLowerCase().includes("no_person")) {
      if (now - lastVoiceTimeRef.current > 5000) {
        message = "Move into the camera frame";
      }
    }

    const count =
      typeof effectiveReps === "number"
        ? effectiveReps
        : typeof data.reps === "number"
        ? data.reps
        : typeof data.count === "number"
        ? data.count
        : repsRef.current;

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
      const u = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(u);
    }
  };

  // ----- END SESSION -----
  const handleEnd = async () => {
    if (!sessionStarted && autoEndedRef.current) return; // already ended

    try {
      await endSessionAPI();
    } catch (e) {
      console.warn("endSessionAPI failed (local only)", e);
    }

    setSessionStarted(false);
  };

  // ----- MAIN LOOP -----
  useEffect(() => {
    const tick = async () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!sessionStarted || !webcamRef.current) return;

      const now = performance.now();
      if (now - lastCaptureRef.current < TARGET_INTERVAL_MS) return;
      if (isProcessingRef.current) return;

      const videoCanvas = webcamRef.current.getCanvas();
      if (!videoCanvas) return;

      let screenshot;
      try {
        screenshot = videoCanvas.toDataURL("image/webp", 0.8);
      } catch {
        screenshot = videoCanvas.toDataURL("image/jpeg", 0.8);
      }

      lastCaptureRef.current = now;

      try {
        isProcessingRef.current = true;
        const data = await analyzeFrame(screenshot);
        if (!data) throw new Error("No response from analyzeFrame");

        const newReps =
          typeof data.reps === "number"
            ? data.reps
            : typeof data.count === "number"
            ? data.count
            : reps;

        setReps(newReps);
        setStage(data.stage ?? "none");
        setAngle(data.angle ?? 0);

        if (data.warning && data.warning.toLowerCase().includes("no_person")) {
          setFeedback("No body detected");
          setIsValid(false);
        } else if (data.feedback) {
          setFeedback(data.feedback);
          setIsValid(true);
        } else {
          setFeedback("Tracking…");
          setIsValid(true);
        }

        setLastGuidance(data.guidance ?? data.guidanceText ?? "");
        setError("");

        if (
          Array.isArray(data.landmarks) &&
          data.landmarks.length > 0 &&
          canvasRef.current
        ) {
          drawSkeleton(data.landmarks, canvasRef.current);
        } else if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // voice coaching (uses newReps)
        handleVoiceOutput(data, newReps);

        // ✅ AUTO-STOP WHEN TARGET REPS REACHED
        const tReps = Number(targetReps);
        if (
          tReps > 0 &&
          newReps >= tReps &&
          !autoEndedRef.current
        ) {
          autoEndedRef.current = true;

          // nice congrats message
          try {
            const msg = `Great job! You completed ${tReps} reps. Session saved.`;
            const u = new SpeechSynthesisUtterance(msg);
            window.speechSynthesis.speak(u);
          } catch (e) {
            console.warn("speech failed:", e);
          }

          await handleEnd(); // will call endSessionAPI and stop session
        }
      } catch (err) {
        console.error("Error analyzing frame:", err);
        setError("Unable to contact server");
      } finally {
        isProcessingRef.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [sessionStarted, targetReps]); // include targetReps


  const handleStart = async () => {
  try {
    await startSessionAPI(targetReps);
  } catch (e) {
    console.warn("startSessionAPI failed (local only)", e);
  }
  setSeconds(0);
  setReps(0);
  repsRef.current = 0;
  setStage("down");
  stageRef.current = "down";
  autoEndedRef.current = false;
  setSessionStarted(true);
};


  // ----- RENDER -----
  return (
    <div className="live-shell">
      {/* LEFT: video */}
      <div className="live-left">
        <div
          className={`live-video-wrapper ${
            !sessionStarted ? "live-video-wrapper--dim" : ""
          }`}
        >
          <div
            className={`live-badge ${
              sessionStarted ? "live-badge--active" : ""
            }`}
          >
            <span className="live-badge-dot" />
            LIVE
          </div>

          <div className="live-time-label">Time: {formatTime()}</div>

          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            screenshotFormat="image/webp"
            videoConstraints={{
              width: 1280,
              height: 720,
              frameRate: { ideal: 60, max: 60 },
            }}
            className="live-video-feed"
          />
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
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

      {/* RIGHT: Session Analysis */}
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

// ---------- Skeleton overlay drawing ----------
const drawSkeleton = (landmarks, canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.fillStyle = "#00ff7b";
  landmarks.forEach((p) => {
    const x = p.x * canvas.width;
    const y = p.y * canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.lineWidth = 4;
  ctx.shadowColor = "#00ff7b";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#00ff7b";

  const connections = [
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 12],
    [23, 24],
    [11, 23],
    [12, 24],
  ];

  connections.forEach(([a, b]) => {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    }
  });

  ctx.restore();
};

export default WebcamCapture;
