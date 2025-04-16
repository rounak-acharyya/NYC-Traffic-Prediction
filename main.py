from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
import os
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)


# ✅ Load Model
model_path = os.path.join(os.path.dirname(__file__), "traffic_model.pkl")

try:
    with open(model_path, "rb") as file:
        model = pickle.load(file)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load model: {str(e)}")
    raise RuntimeError("Failed to load model")

app = FastAPI()

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Pydantic Schema
class TrafficInput(BaseModel):
    hour: int = Field(..., description="Hour of the day (0-23)")
    month: int = Field(..., description="Month (1-12)")
    x: float = Field(..., description="Longitude coordinate")
    y: float = Field(..., description="Latitude coordinate")

# ✅ API Routes
@app.get("/api/traffic")
def get_traffic(page: int = Query(1), limit: int = Query(10)):
    return {
        "page": page,
        "limit": limit,
        "data": [
            {"location": "NYC", "traffic_volume": 350},
            {"location": "LA", "traffic_volume": 220}
        ]
    }

@app.post("/api/predict")
async def predict_traffic(data: TrafficInput):
    try:
        features = np.array([[data.hour, data.month, data.x, data.y]])
        prediction = model.predict(features)
        return {"prediction": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
