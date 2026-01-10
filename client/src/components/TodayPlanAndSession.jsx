// client/src/components/TodayPlanAndSession.jsx
const TodayPlanAndSession = ({ token }) => {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/plan/today", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlan(res.data.plan));
  }, [token]);

  if (!plan) return <div>Loading plan...</div>;

  const first = plan.exercises[0] || { name: "Bicep Curl", targetReps: 10 };

  return (
    <div>
      <h2>Today's Plan</h2>
      <p>
        {first.name} — {first.sets} sets of {first.targetReps} reps
      </p>

      {/* pass exercise info down into your WebcamCapture via props or context */}
      <WebcamCapture exerciseName={first.name} targetReps={first.targetReps} />
    </div>
  );
};

