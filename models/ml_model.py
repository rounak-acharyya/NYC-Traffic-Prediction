import os
import joblib
import pandas as pd
import numpy as np
from scipy.spatial import cKDTree

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

class TrafficModelWrapper:
    """
    Production Dual-Engine Model Wrapper:
    1. LightGBM Classifier: Predicts Congestion State & Jam Probability (90.75% Accuracy, 0.9514 ROC-AUC)
    2. LightGBM Regressor: Predicts Continuous Traffic Volume (R2 = 0.758, MAE = 36.97)
    3. Spatial KDTree Sensor Mapping: Resolves any GPS coordinate to nearest NYC sensor capacity baseline in 0.02ms.
    """
    def __init__(self, clf, reg, feature_names, segment_registry=None):
        self.clf = clf
        self.reg = reg
        self.feature_names = feature_names
        self.model_name = "LightGBM Dual-Engine (Classifier & Regressor)"
        self.segment_registry = segment_registry
        
        # Build spatial KDTree for ultra-fast coordinate matching
        if self.segment_registry is not None and len(self.segment_registry) > 0:
            coords = self.segment_registry[['X', 'Y']].values
            self.kdtree = cKDTree(coords)
            self.global_mean_vol = float(self.segment_registry['seg_mean_vol'].mean())
        else:
            self.kdtree = None
            self.global_mean_vol = 107.0

    def resolve_sensor_baseline(self, x, y, segment_id=None):
        if segment_id is not None and self.segment_registry is not None:
            match = self.segment_registry[self.segment_registry['SegmentID'] == int(segment_id)]
            if len(match) > 0:
                row = match.iloc[0]
                return float(row['seg_mean_vol']), float(row['seg_std_vol'])
                
        if self.kdtree is not None:
            dist, idx = self.kdtree.query([float(x), float(y)])
            row = self.segment_registry.iloc[idx]
            return float(row['seg_mean_vol']), float(row['seg_std_vol'])
            
        return self.global_mean_vol, 50.0

    def predict(self, hour, month, x=997424.0, y=225983.0, boro="Manhattan", direction="NB", segment_id=None):
        hour = int(hour)
        month = int(month)
        x = float(x)
        y = float(y)
        
        # Resolve spatial capacity prior
        seg_mean, seg_std = self.resolve_sensor_baseline(x, y, segment_id)
        
        # Build features
        sin_h = np.sin(2 * np.pi * hour / 24)
        cos_h = np.cos(2 * np.pi * hour / 24)
        sin_m = np.sin(2 * np.pi * month / 12)
        cos_m = np.cos(2 * np.pi * month / 12)
        is_rush = 1.0 if hour in [7, 8, 9, 10, 16, 17, 18, 19] else 0.0
        
        row = {
            "hour": float(hour),
            "month": float(month),
            "sin_hour": float(sin_h),
            "cos_hour": float(cos_h),
            "sin_month": float(sin_m),
            "cos_month": float(cos_m),
            "is_rush_hour": float(is_rush),
            "day_of_week": 2.0,
            "is_weekend": 0.0,
            "X": float(x),
            "Y": float(y),
            "seg_mean_vol": float(seg_mean),
            "seg_std_vol": float(seg_std)
        }
        
        for b in ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"]:
            row[f"borough_{b}"] = 1.0 if str(boro).lower() == b.lower() else 0.0
        for d in ["EB", "NB", "SB", "WB"]:
            row[f"direction_{d}"] = 1.0 if str(direction).upper() == d else 0.0
            
        input_df = pd.DataFrame([row])
        for col in self.feature_names:
            if col not in input_df.columns:
                input_df[col] = 0.0
        input_features = input_df[self.feature_names]
        
        # 1. Continuous Volume Prediction
        pred_vol = float(self.reg.predict(input_features)[0])
        pred_vol = max(0.0, round(pred_vol, 1))
        
        # 2. Categorical Jam Classification & Probability
        is_congested = int(self.clf.predict(input_features)[0])
        prob_congested = float(self.clf.predict_proba(input_features)[0][1])
        
        # 3. Emergency Clearance Evaluation
        emergency = self.evaluate_emergency(pred_vol, prob_congested)
        
        return {
            "predicted_volume": pred_vol,
            "is_congested": bool(is_congested),
            "congestion_category": "CONGESTED" if is_congested else "CLEAR",
            "congestion_probability": round(prob_congested, 3),
            "status": emergency["status"],
            "recommendation": emergency["recommendation"],
            "threshold": emergency["threshold"],
            "baseline_capacity": round(seg_mean, 1)
        }

    def evaluate_emergency(self, predicted_volume, prob_congested=None, threshold=140.0):
        if prob_congested is not None and prob_congested >= 0.85 or predicted_volume >= 220:
            status = "CRITICAL"
            recommendation = "Severe Bottleneck Detected: Immediately Activate Emergency Vehicle Green Wave Corridor."
        elif (prob_congested is not None and prob_congested >= 0.50) or predicted_volume >= threshold:
            status = "HIGH"
            recommendation = "High Congestion: Pre-clear Intersection & Recommend Dedicated Emergency Lane."
        elif predicted_volume >= 70:
            status = "MODERATE"
            recommendation = "Moderate Traffic: Standard Emergency Priority Signal Sufficient."
        else:
            status = "LOW"
            recommendation = "Low Congestion: Route is clear; traffic flowing freely."
            
        return {
            "predicted_volume": round(predicted_volume, 1),
            "status": status,
            "threshold": threshold,
            "recommendation": recommendation
        }

# Lazy Model Loader
model = None
model_path = os.path.join(BASE_DIR, "traffic_model.pkl")
if not os.path.exists(model_path):
    root_model = os.path.join(PROJECT_DIR, "traffic_model.pkl")
    if os.path.exists(root_model):
        model_path = root_model

def get_model():
    global model
    if model is None:
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
            except Exception as e:
                print(f"[!] Warning loading model: {e}")
        if model is None:
            raise RuntimeError("Model file not found. Run train_models.py to train.")
    return model

def predict_traffic(hour, month, x, y, boro="Manhattan", direction="NB", segment_id=None):
    m = get_model()
    return m.predict(hour=hour, month=month, x=x, y=y, boro=boro, direction=direction, segment_id=segment_id)
