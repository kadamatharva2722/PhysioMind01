from fastapi import FastAPI
from pydantic import BaseModel
import base64
import numpy as np
import cv2

from model.rep_model import BicepCurlRepCounter

app = FastAPI()

# GLOBAL SHARED MODEL — required for persistent rep counting
rep_model = BicepCurlRepCounter()

class FrameRequest(BaseModel):
    image: str


def decode_img(data: str):
    """Decode Base64 → OpenCV frame"""
    if "," in data:
        data = data.split(",")[1]
    decoded = base64.b64decode(data)
    np_arr = np.frombuffer(decoded, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


@app.post("/analyze")
async def analyze(body: FrameRequest):
    """Analyze a single frame for angle, stage and rep count"""
    try:
        frame = decode_img(body.image)
    except Exception as e:
        return {"error": "invalid_image", "message": str(e)}

    try:
        result = rep_model.process_frame(frame)

        # Guarantee always dict response
        if not isinstance(result, dict):
            return {
                "angle": 0,
                "count": 0,
                "stage": "none",
                "warning": "no_result",
            }

        # Python returns "count" → Node expects "count"
        angle = int(result.get("angle", 0))
        count = int(result.get("count", 0))
        stage = result.get("stage", "none")

        return {
            "angle": angle,
            "count": count,          # <--- FIXED (Node expects this)
            "stage": stage,
            "warning": result.get("warning", "none"),
            "guidance": result.get("guidance", ""),
            "event": result.get("event", None),
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": "processing_error", "message": str(e)}


@app.post("/reset")
async def reset():
    """Reset counter when session starts"""
    rep_model.reset()
    return {"reset": True}