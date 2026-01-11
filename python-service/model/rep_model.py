import logging

# ------------------ SAFE IMPORTS ------------------
try:
    import cv2
    import numpy as np
    CV_AVAILABLE = True
except Exception:
    cv2 = None
    np = None
    CV_AVAILABLE = False

try:
    import mediapipe as mp
    MP_AVAILABLE = True
    mp_pose = mp.solutions.pose
except Exception:
    mp = None
    mp_pose = None
    MP_AVAILABLE = False

# ------------------ LOGGER ------------------
logger = logging.getLogger("rep_model")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[rep_model] %(levelname)s: %(message)s"))
    logger.addHandler(handler)


# =================================================
#          BICEP CURL REP COUNTER (STABLE)
# =================================================
class BicepCurlRepCounter:
    """
    Render-safe, stable bicep curl counter.

    ✔ Uses MediaPipe Pose (lightweight)
    ✔ Counts reps on up → down
    ✔ Only requires arm + shoulder visibility
    ✔ Gracefully handles model failures
    """

    def __init__(self):
        self.counter = 0
        self.stage = "down"
        self.prev_angle = None
        self.pose = None  # lazy loaded

    # ------------------ POSE INITIALIZER ------------------
    def get_pose(self):
        if not MP_AVAILABLE:
            logger.error("MediaPipe not available")
            return None

        if self.pose is None:
            try:
                self.pose = mp_pose.Pose(
                    static_image_mode=False,
                    model_complexity=0,  # 🔥 MOST IMPORTANT
                    enable_segmentation=False,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5,
                    smooth_landmarks=True,
                )
                logger.info("MediaPipe Pose initialized (lightweight)")
            except Exception as e:
                logger.error(f"Failed to initialize pose model: {e}")
                self.pose = None

        return self.pose

    # ------------------ RESET ------------------
    def reset(self):
        self.counter = 0
        self.stage = "down"
        self.prev_angle = None

    # ------------------ ANGLE ------------------
    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(
            a[1] - b[1], a[0] - b[0]
        )
        angle = abs(radians * 180.0 / np.pi)
        if angle > 180:
            angle = 360 - angle
        return float(angle)

    # ------------------ ARM SELECTION ------------------
    def choose_arm(self, lm):
        left_score = (
            lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value].visibility +
            lm[mp_pose.PoseLandmark.LEFT_ELBOW.value].visibility +
            lm[mp_pose.PoseLandmark.LEFT_WRIST.value].visibility
        )
        right_score = (
            lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].visibility +
            lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].visibility +
            lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].visibility
        )
        return "left" if left_score >= right_score else "right"

    # ------------------ MAIN PROCESS ------------------
    def process_frame(self, frame):
        # ❌ Basic availability check
        if frame is None or not (CV_AVAILABLE and MP_AVAILABLE):
            return self._pose_unavailable()

        pose = self.get_pose()
        if pose is None:
            return self._pose_unavailable()

        try:
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image)
        except Exception as e:
            logger.error(f"Pose processing failed: {e}")
            return self._pose_unavailable()

        if not results.pose_landmarks:
            return {
                "angle": 0,
                "count": self.counter,
                "stage": "none",
                "warning": "no_person",
                "guidance": "Please step back so your upper body is visible.",
                "event": None,
            }

        lm = results.pose_landmarks.landmark
        arm = self.choose_arm(lm)

        if arm == "left":
            shoulder = [lm[11].x, lm[11].y]
            elbow = [lm[13].x, lm[13].y]
            wrist = [lm[15].x, lm[15].y]
            vis_sum = lm[11].visibility + lm[13].visibility + lm[15].visibility
        else:
            shoulder = [lm[12].x, lm[12].y]
            elbow = [lm[14].x, lm[14].y]
            wrist = [lm[16].x, lm[16].y]
            vis_sum = lm[12].visibility + lm[14].visibility + lm[16].visibility

        # ❌ Arm not visible clearly
        if vis_sum < 1.2:
            return {
                "angle": 0,
                "count": self.counter,
                "stage": "none",
                "warning": "low_visibility",
                "guidance": "Keep your shoulder, elbow, and wrist visible.",
                "event": None,
            }

        angle = self.calculate_angle(shoulder, elbow, wrist)

        # Smooth angle
        if self.prev_angle is not None:
            angle = 0.6 * angle + 0.4 * self.prev_angle
        self.prev_angle = angle

        event = None

        # Rep logic
        if angle > 90:
            self.stage = "up"

        if angle < 50 and self.stage == "up":
            self.stage = "down"
            self.counter += 1
            event = "rep_completed"
            logger.info(f"Rep completed → {self.counter}")

        # Guidance
        guidance = ""
        if angle > 150:
            guidance = "Lower your arm fully before curling."
        elif angle < 35:
            guidance = "Good squeeze at the top!"

        return {
            "angle": int(angle),
            "count": int(self.counter),
            "stage": self.stage,
            "warning": "none",
            "guidance": guidance,
            "event": event,
        }

    # ------------------ ERROR HELPERS ------------------
    def _pose_unavailable(self):
        return {
            "angle": 0,
            "count": self.counter,
            "stage": "none",
            "warning": "pose_unavailable",
            "guidance": "Pose model unavailable. Please wait a moment.",
            "event": None,
        }
