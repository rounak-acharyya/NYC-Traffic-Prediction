from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import joblib
import json
import os
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrafficAPI")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "traffic_model.pkl")

model = None
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        logger.info(f"Model loaded successfully from {model_path}")
    else:
        logger.warning(f"traffic_model.pkl not found at {model_path}.")
except Exception as e:
    logger.error(f"Error loading model: {e}")

app = FastAPI(
    title="NYC Traffic AI & Emergency Corridor Dual-Engine API",
    description="High-Accuracy Congestion Classification (90.7%+) and Regression (R2 0.76) for Emergency Route Prioritization.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrafficInput(BaseModel):
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    month: int = Field(..., ge=1, le=12, description="Month of the year (1-12)")
    x: float = Field(default=997424.0, description="Longitude coordinate (X)")
    y: float = Field(default=225983.0, description="Latitude coordinate (Y)")
    borough: str = Field(default="Manhattan", description="Borough name")
    direction: str = Field(default="NB", description="Traffic direction (NB, SB, EB, WB)")
    segment_id: int | None = Field(default=None, description="Optional NYC DOT SegmentID")

@app.get("/api/traffic")
def get_traffic(page: int = Query(1), limit: int = Query(10)):
    summary_path = os.path.join(BASE_DIR, "data", "traffic_summary.json")
    if os.path.exists(summary_path):
        with open(summary_path, "r", encoding="utf-8") as f:
            summary = json.load(f)
            return {
                "page": page,
                "limit": limit,
                "total": summary.get("total_records", 2026155),
                "data": summary.get("hourly_congestion", [])
            }
    return {
        "page": page,
        "limit": limit,
        "total": 24,
        "data": [
            {"time": f"{h:02d}:00", "congestion": 45 + (20 if h in [8, 9, 17, 18] else 0), "avgSpeed": 28.0, "density": 55.0, "accidents": 2}
            for h in range(24)
        ]
    }

@app.post("/api/predict")
async def predict_traffic_endpoint(data: TrafficInput):
    global model
    if model is None:
        if os.path.exists(model_path):
            model = joblib.load(model_path)
        else:
            raise HTTPException(status_code=503, detail="Traffic AI model is not loaded. Run train_models.py first.")
    
    try:
        res = model.predict(
            hour=data.hour,
            month=data.month,
            x=data.x,
            y=data.y,
            boro=data.borough,
            direction=data.direction,
            segment_id=data.segment_id
        )
        return {
            "prediction": res["predicted_volume"],
            "volume": res["predicted_volume"],
            "is_congested": res["is_congested"],
            "congestion_category": res["congestion_category"],
            "congestion_probability": res["congestion_probability"],
            "status": res["status"],
            "recommendation": res["recommendation"],
            "threshold": res["threshold"],
            "baseline_capacity": res.get("baseline_capacity", 120.0)
        }
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/models")
def get_models_benchmark():
    metrics_path = os.path.join(BASE_DIR, "models", "benchmark_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"message": "No benchmark metrics found. Run train_models.py to benchmark models."}

if __name__ == "__main__":
    uvicorn.run("main.py:app", host="127.0.0.1", port=8000, reload=True)
