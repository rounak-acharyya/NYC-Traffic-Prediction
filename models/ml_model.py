import joblib
import pandas as pd
import os

# ✅ Dynamically locate the model path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "traffic_model.pkl")

# ✅ Load the model with error handling and type checking
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}")

try:
    model = joblib.load(model_path)  # Load the model
    print(f"Model type: {type(model)}")  # Debugging: Check model type
except Exception as e:
    raise RuntimeError(f"Error loading model: {str(e)}")

# ✅ Function to make predictions and check model type
def predict_traffic(hour, month, x, y):
    try:
        # ✅ Validate and convert input
        hour, month, x, y = map(float, [hour, month, x, y])

        # ✅ Create DataFrame for prediction
        input_data = pd.DataFrame([[hour, month, x, y]], columns=['hour', 'month', 'X', 'Y'])

        # ✅ Make predictions
        prediction = model.predict(input_data)[0]

        # ✅ Return raw prediction (FastAPI handles JSON serialization)
        return prediction

    # ✅ Catch specific exceptions
    except ValueError as ve:
        raise RuntimeError(f"Invalid input values: {str(ve)}")
    except KeyError as ke:
        raise RuntimeError(f"Data processing error: {str(ke)}")
    except Exception as e:
        raise RuntimeError(f"Error making prediction: {str(e)}")
