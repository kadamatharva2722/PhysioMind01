// server/src/utils/SessionEvaluator.js
export default class SessionEvaluator {
  constructor(targetReps = 10) {
    this.reset();
    this.targetReps = targetReps;
  }

  reset() {
    this.sessionActive = false;
    this.userId = null;

    this.exerciseName = "Bicep Curl";
    this.targetReps = 10;

    this.completedReps = 0;
    this.lastReps = 0;

    this.totalFrames = 0;
    this.correctFormFrames = 0;
    this.angles = [];

    this.startTime = null;
  }

  startSession({ userId, exerciseName, targetReps }) {
    this.reset();
    this.sessionActive = true;

    this.userId = userId;
    this.exerciseName = exerciseName || "Bicep Curl";
    this.targetReps = Number(targetReps) || 10;

    this.startTime = Date.now();
  }

  processFrame(angle, stage, reps) {
    if (!this.sessionActive) return;

    this.totalFrames++;
    this.angles.push(angle);

    if (stage !== "bad_form") this.correctFormFrames++;

    if (reps > this.lastReps) {
      this.completedReps++;
    }

    this.lastReps = reps;
  }

  getSessionData() {
    return {
      completedReps: this.completedReps,
      targetReps: this.targetReps,
      totalFrames: this.totalFrames,
      correctFormFrames: this.correctFormFrames,
      avgAngle:
        this.angles.length
          ? Math.round(
              this.angles.reduce((a, b) => a + b, 0) / this.angles.length
            )
          : 0,
      maxAngle: this.angles.length ? Math.max(...this.angles) : 0,
      minAngle: this.angles.length ? Math.min(...this.angles) : 0,
      durationSeconds: this.startTime
        ? Math.round((Date.now() - this.startTime) / 1000)
        : 0,
    };
  }
}
