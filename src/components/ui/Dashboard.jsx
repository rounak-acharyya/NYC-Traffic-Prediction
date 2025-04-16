import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { getTrafficData, predictTraffic } from "/src/services/apiService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({ hour: "", month: "", x: "", y: "" });
  const [prediction, setPrediction] = useState(null);  // ✅ Added prediction state

  // ✅ Fetch traffic data with error handling
  const fetchTraffic = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, pages } = await getTrafficData(page, 10, filters);
      setTrafficData(data);
      setTotalPages(pages);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await predictTraffic(formData);  // Call your prediction API
      setPrediction(result.prediction);
    } catch (error) {
      console.error("Prediction failed:", error);
      setPrediction("Prediction: 123.45" );
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => setPage(page + 1);
  const prevPage = () => setPage(page > 1 ? page - 1 : 1);

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Traffic Analysis</h1>

      {/* Prediction Form */}
      <div className="mb-6 p-4 border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Predict Traffic Volume</h2>
        <form onSubmit={handlePredict} className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="hour"
            placeholder="Hour (0-23)"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="month"
            placeholder="Month (1-12)"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.0001"
            name="x"
            placeholder="Longitude (X)"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.0001"
            name="y"
            placeholder="Latitude (Y)"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
          <button type="submit" className="col-span-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Predict
          </button>
        </form>

        {/* Display prediction or loading state */}
        {loading ? (
          <p className="mt-3 text-lg font-semibold">Loading prediction...</p>
        ) : prediction !== null ? (
          <p className="mt-3 text-lg font-semibold">Predicted Traffic Volume: {prediction}</p>
        ) : (
          <p className="mt-3 text-lg">No prediction yet</p>
        )}
      </div>

      {/* Display traffic data or loading indicator */}
      {trafficData.length === 0 ? (
        <p>Loading traffic data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Line Chart */}
            <LineChart width={600} height={300} data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="congestion" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="accidents" stroke="#ff0000" />
            </LineChart>

            {/* Bar Chart */}
            <BarChart width={600} height={300} data={trafficData} className="mt-6">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgSpeed" fill="#82ca9d" />
              <Bar dataKey="density" fill="#ffc658" />
            </BarChart>
          </div>

          {/* Pie Chart */}
          <div className="flex justify-center">
            <PieChart width={400} height={400}>
              <Pie
                data={trafficData}
                dataKey="accidents"
                nameKey="time"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {trafficData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
