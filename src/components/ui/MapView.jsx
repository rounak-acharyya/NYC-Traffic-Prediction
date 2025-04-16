import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { predictTraffic } from "../../services/apiService";
  // 🚀 Import the prediction service

// Google Maps-style Red Marker
const customMarker = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapView = ({ darkMode }) => {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromPosition, setFromPosition] = useState(null);
  const [toPosition, setToPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);   // Route details
  const [prediction, setPrediction] = useState(null); // ML Prediction
  const [satelliteView, setSatelliteView] = useState(true);

  const orsApiKey = "5b3ce3597851110001cf62487bbe2039cf7140a19a66dc0551e1198c";
  const backendUrl = "http://localhost:5000/api/traffic";

  // 🔥 Geocode Function
  const getCoordinates = async (query, setPosition) => {
    if (!query) return;

    const url = `https://api.openrouteservice.org/geocode/search?api_key=${orsApiKey}&text=${encodeURIComponent(query)}&size=5`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.features.length > 0) {
        const bestMatch = data.features[0];
        const [lng, lat] = bestMatch.geometry.coordinates;
        setPosition([lat, lng]);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Failed to fetch location");
    }
  };

  // 🔥 Fetch Route and Send to Backend
  const getRoute = async () => {
    if (!fromPosition || !toPosition) {
      alert("Please enter valid 'From' and 'To' locations first.");
      return;
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${fromPosition[1]},${fromPosition[0]}&end=${toPosition[1]},${toPosition[0]}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeCoords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRoute(routeCoords);

        // 🚀 Retrieve traffic data from MongoDB
        const backendResponse = await axios.get(backendUrl, {
          params: {
            start: `${fromPosition[1]},${fromPosition[0]}`,
            end: `${toPosition[1]},${toPosition[0]}`
          }
        });

        console.log("Backend response:", backendResponse.data);

        const trafficData = backendResponse.data;

        // 🔥 Prepare input for ML prediction
        const inputData = {
          distance: trafficData.distance,
          duration: trafficData.duration,
          congestion_level: trafficData.congestionLevel
        };

        // 🚀 ML Prediction Call
        const mlPrediction = await predictTraffic(inputData);
        console.log("ML Prediction:", mlPrediction);

        // 🚦 Update route information
        setRouteInfo({
          distance: trafficData.distance,
          duration: trafficData.duration,
          congestionLevel: trafficData.congestionLevel,
          trafficVolume: trafficData.trafficVolume || "N/A",
        });

        // ⚙️ Set ML Prediction
        setPrediction(mlPrediction?.prediction || "N/A");

      } else {
        alert("No route found! Try adjusting locations.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Failed to fetch route. Please check your locations or try again.");
    }
  };

  // 🔥 Smooth Fly Animation
  const MapFlyTo = ({ positions }) => {
    const map = useMap();
    useEffect(() => {
      if (positions.length) {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [positions]);
    return null;
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <h2 className="text-2xl font-bold text-center mb-4">Search for Directions</h2>

      <div className="flex flex-col items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="From..."
          value={fromQuery}
          onChange={(e) => setFromQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getCoordinates(fromQuery, setFromPosition)}
          className="w-3/4 p-2 rounded-md border"
        />
        <input
          type="text"
          placeholder="To..."
          value={toQuery}
          onChange={(e) => setToQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getCoordinates(toQuery, setToPosition)}
          className="w-3/4 p-2 rounded-md border"
        />
        <button onClick={() => getCoordinates(fromQuery, setFromPosition)} className="p-2 bg-blue-500 text-white rounded">Set From</button>
        <button onClick={() => getCoordinates(toQuery, setToPosition)} className="p-2 bg-blue-500 text-white rounded">Set To</button>
        <button onClick={getRoute} className="p-2 bg-green-500 text-white rounded">Get Directions</button>
        <button onClick={() => setSatelliteView(!satelliteView)} className="p-2 bg-gray-600 text-white rounded">
          {satelliteView ? "Switch to Map View" : "Switch to Satellite"}
        </button>
      </div>

      <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: "500px", width: "100%" }} scrollWheelZoom={true} maxZoom={20}>
        <MapFlyTo positions={[fromPosition, toPosition].filter(Boolean)} />

        <TileLayer
          url={
            satelliteView
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> & OpenStreetMap contributors'
        />

        {fromPosition && (
          <Marker position={fromPosition} icon={customMarker}>
            <Popup>From: {fromQuery}</Popup>
          </Marker>
        )}

        {toPosition && (
          <Marker position={toPosition} icon={customMarker}>
            <Popup>To: {toQuery}</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="blue" weight={5} />}
      </MapContainer>

      {/* 🚀 Route Information */}
      {routeInfo && (
        <div className="mt-4 p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-bold">Route Info</h3>
          <p>📊 <strong>ML Prediction:</strong> {prediction}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
