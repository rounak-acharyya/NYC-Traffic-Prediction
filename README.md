# 🚑 Spatio-Temporal Traffic Telemetry Analysis & Dual-Engine Prediction System for Emergency Services

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Classifier Accuracy](https://img.shields.io/badge/Classifier_Accuracy-92.82%25-brightgreen.svg)]()
[![Classifier ROC-AUC](https://img.shields.io/badge/ROC--AUC-0.9752-blueviolet.svg)]()
[![Regressor R2](https://img.shields.io/badge/Regressor_R%C2%B2-0.8079-blue.svg)]()

---

## 📌 Executive Summary & Architecture Overview

In major metropolitan centers like New York City, emergency vehicles face critical delays due to recurring gridlock and uncoordinated traffic signaling. This platform delivers a production **Dual-Engine AI/ML Spatio-Temporal Traffic Telemetry System** designed specifically for real-time emergency vehicle corridor management:

1. **Emergency Congestion Jam Classification Engine:** Accurately classifies whether an urban corridor is experiencing a severe bottleneck (**92.82% Accuracy, 0.9752 ROC-AUC**), triggering automated Green Wave signal prioritization and emergency lane advisories.
2. **High-Fidelity Traffic Flow Regression Engine:** Estimates exact continuous vehicle volume (**R² = 0.8079, MAE = 29.65**), achieving a 51% reduction in error over baselines.
3. **Spatial Sensor Capacity Registry & KDTree:** Pre-indexes historical capacity baselines for all **14,950 NYC DOT street sensors**, resolving any GPS coordinate to its nearest sensor in **0.02 milliseconds**.

---

## 👥 AI/ML & Data Analytics Team (Team 7)

- **Rounak Acharyya** (23BCE7957)
- **Lakshya Parashar** (23BCE8333)
- **Gavini Sai Geeteswa Sudarshan** (23BCE8626)

---

## 🏆 Multi-Model Benchmark Suites & Evaluation

Both suites were rigorously benchmarked on identical test partitions (30,064 unseen telemetry records):

### 1. Classification Suite (Emergency Congestion Alert & Jam Detection)
| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **LightGBM Classifier (Champion)** 🏆 | **92.82%** | **0.8529** | **0.8316** | **0.9279** | **0.9752** |
| **XGBoost Classifier** | 92.75% | 0.8515 | 0.8297 | 0.9271 | 0.9744 |
| **Random Forest Classifier (RFC)** | 92.71% | 0.8518 | 0.8271 | 0.9267 | 0.9738 |
| **HistGradientBoosting** | 92.60% | 0.8464 | 0.8291 | 0.9257 | 0.9740 |
| **Decision Tree** | 91.42% | 0.8154 | 0.8109 | 0.9141 | 0.9392 |
| **Logistic Regression** | 89.52% | 0.8636 | 0.6473 | 0.8896 | 0.9402 |

### 2. Regression Suite (Continuous Vehicle Volume Prediction)
| Model Architecture | MAE (Vehicles) | RMSE (Vehicles) | R² Score | Latency (ms/sample) |
| :--- | :---: | :---: | :---: | :---: |
| **Random Forest (RFR)** 🏆 | **29.65** | **68.50** | **0.8079** | 0.1309 ms |
| **XGBoost Regressor** | 29.80 | 68.64 | **0.8071** | 0.0213 ms |
| **LightGBM Regressor** | 29.81 | 69.28 | **0.8036** | **0.0203 ms** |
| **HistGradientBoosting** | 31.17 | 70.92 | 0.7941 | 0.0139 ms |
| **Ridge Baseline** | 45.89 | 86.14 | 0.6963 | 0.0008 ms |
| **Decision Tree** | 33.96 | 87.42 | 0.6872 | 0.0275 ms |

---

## 🚦 Emergency Corridor Advisory Decision Protocol

- **LOW** (< 70 veh/hr, < 25% Jam Probability): Route is completely clear; normal vehicle progression.
- **MODERATE** (70 - 140 veh/hr, 25-50% Jam Probability): Standard emergency vehicle priority signal adjustment.
- **HIGH** (140 - 220 veh/hr, 50-85% Jam Probability): High congestion; pre-clear intersection & recommend dedicated emergency lane.
- **CRITICAL** (≥ 220 veh/hr or ≥ 85% Jam Probability): Severe bottleneck detected; immediately activate automated Green Wave emergency corridor.

---

## 🛠️ Project Structure

`
Traffic-AI_FINAL-main/
│
├── data/
│   ├── segment_registry.parquet        # 14,950 sensor capacity baselines
│   ├── partitions/                     # Stratified parquet partitions for fast training
│   │   ├── train.parquet               # 120,000 training records
│   │   ├── test.parquet                # 30,000 test evaluation records
│   │   └── sample_150k.parquet         # Stratified sample
│   └── traffic_summary.json            # 24-hr telemetry summary for dashboard
│
├── models/
│   ├── ml_model.py                     # Dual-Engine TrafficModelWrapper & KDTree resolver
│   ├── traffic_model.pkl               # Production dual model (Classifier + Regressor)
│   └── benchmark_metrics.json          # Metrics across all 12 model evaluations
│
├── Python code and Report/
│   ├── python main code.ipynb          # Fully executed notebook with dual leaderboards & charts
│   └── Report of the project.pdf       # Project report (preserved)
│
├── src/                                # React Frontend
│   ├── components/ui/                  # Dashboard, MapView, SearchableMap, Sidebar
│   ├── services/apiService.js          # REST client for FastAPI endpoints
│   └── App.jsx, main.jsx, index.css
│
├── data_pipeline.py                    # Feature engineering & registry extraction
├── train_models.py                     # Dual-suite model training & benchmarking
├── main.py                             # FastAPI production REST API server
├── requirements.txt                    # Python environment dependencies
└── package.json                        # Node.js dependencies
`

---

## ⚡ Quickstart & Usage

### 1. Install Dependencies
`ash
pip install -r requirements.txt
npm install --legacy-peer-deps
`

### 2. Launch Backend API
`ash
python -m uvicorn main:app --reload --port 8000
`
API Documentation (Swagger UI): http://127.0.0.1:8000/docs

### 3. Launch React Dashboard
`ash
npm run dev
`
Open http://localhost:5173 to explore the live dashboard and real-time routing map.
