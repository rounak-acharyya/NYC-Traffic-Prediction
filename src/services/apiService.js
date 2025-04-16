import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // FastAPI backend URL

// ✅ Fetch traffic data with pagination and filtering
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
      pages: response.data.pages,
    };
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw new Error("Failed to fetch traffic data. Please try again later.");
  }
};

// ✅ Prediction API with Correct Payload and Improved Error Handling
export const predictTraffic = async (inputData) => {
  try {
    // ✅ Map frontend keys to backend schema
    const payload = {
      hour: parseInt(inputData.hour),                  // Convert to integer
      month: parseInt(inputData.month),                // Convert to integer
      x: parseFloat(inputData.longitude),              // Convert to float (longitude → x)
      y: parseFloat(inputData.latitude)                // Convert to float (latitude → y)
    };

    console.log("🚀 Sending Payload:", JSON.stringify(payload));

    // ✅ Improved validation checks
    if (isNaN(payload.x) || isNaN(payload.y)) {
      console.error("Invalid coordinates. Longitude and latitude must be valid numbers.");
      alert("Please select a valid location on the map.");
      return;  // Prevent invalid request
    }
    
    if (isNaN(payload.hour) || payload.hour < 0 || payload.hour > 23) {
      console.error("Invalid hour:", payload.hour);
      throw new Error("Invalid hour. It must be an integer between 0 and 23.");
    }

    if (isNaN(payload.month) || payload.month < 1 || payload.month > 12) {
      console.error("Invalid month:", payload.month);
      throw new Error("Invalid month. It must be an integer between 1 and 12.");
    }

    // ✅ API call
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

    // 🛠️ Improved error messaging
    if (error.response && error.response.data) {
      throw new Error(`Prediction failed: ${error.response.data.detail}`);
    } else {
      throw new Error("Failed to get prediction. Please check your input values and try again.");
    }
  }
};
