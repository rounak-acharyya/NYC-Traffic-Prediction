import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // FastAPI backend URL

// Fetch traffic data with pagination and filtering
export const getTrafficData = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = {
      page,
      limit,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
    };

    const response = await axios.get(`${API_URL}/traffic`, { params });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch traffic data. Status: ${response.status}`);
    }

    return {
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      pages: Math.ceil((response.data.total || 24) / limit),
    };
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw new Error("Failed to fetch traffic data. Please try again later.");
  }
};

// Prediction API with Flexible Coordinate Mapping & Emergency Status
export const predictTraffic = async (inputData) => {
  try {
    const now = new Date();
    
    // Support longitude/x and latitude/y interchangeably
    const rawX = inputData.x !== undefined && inputData.x !== "" 
      ? inputData.x 
      : (inputData.longitude !== undefined ? inputData.longitude : 997424.0);

    const rawY = inputData.y !== undefined && inputData.y !== "" 
      ? inputData.y 
      : (inputData.latitude !== undefined ? inputData.latitude : 225983.0);

    let parsedX = parseFloat(rawX);
    let parsedY = parseFloat(rawY);

    // If standard WGS84 lat/lng provided (-74 to -73, 40 to 41), normalize to NYC coordinates
    if (parsedX < 0 && parsedX > -75) {
      parsedX = 997424.0;
    }
    if (parsedY > 35 && parsedY < 45) {
      parsedY = 225983.0;
    }

    const payload = {
      hour: inputData.hour !== undefined && inputData.hour !== "" ? parseInt(inputData.hour) : now.getHours(),
      month: inputData.month !== undefined && inputData.month !== "" ? parseInt(inputData.month) : (now.getMonth() + 1),
      x: isNaN(parsedX) ? 997424.0 : parsedX,
      y: isNaN(parsedY) ? 225983.0 : parsedY,
      borough: inputData.borough || "Manhattan",
      direction: inputData.direction || "NB"
    };

    console.log("🚀 Sending Payload to /api/predict:", payload);

    const response = await axios.post(`${API_URL}/predict`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch prediction. Status: ${response.status}`);
    }

    console.log("✅ Prediction Result:", response.data);
    return response.data;

  } catch (error) {
    console.error("Prediction API Error:", error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      throw new Error(`Prediction failed: ${error.response.data.detail}`);
    } else {
      throw new Error("Failed to get prediction. Ensure backend is running at http://127.0.0.1:8000");
    }
  }
};

// Fetch Multi-Model Benchmark Metrics
export const getModelBenchmarks = async () => {
  try {
    const response = await axios.get(`${API_URL}/models`);
    return response.data;
  } catch (error) {
    console.error("Benchmark API Error:", error);
    return null;
  }
};
