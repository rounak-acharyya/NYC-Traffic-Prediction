import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Google Maps-style Red Marker
const customMarker = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const SearchableMap = ({ darkMode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState([48.8566, 2.3522]); // Default: Paris
  const [locationName, setLocationName] = useState("");
  const [zoomLevel, setZoomLevel] = useState(15); // Keep zoom level stable
  const [satelliteView, setSatelliteView] = useState(true); // Toggle for Satellite View

  const getCoordinates = async () => {
    if (!searchQuery) return alert("Enter a location!");

    const apiKey = "5b3ce3597851110001cf62487bbe2039cf7140a19a66dc0551e1198c";
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(searchQuery)}&size=10`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.features.length > 0) {
        // Prioritize the most detailed and relevant result
        const sortedResults = data.features.sort((a, b) => {
          return (b.properties.confidence - a.properties.confidence) || (b.properties.rank_importance - a.properties.rank_importance);
        });
        const bestMatch = sortedResults[0];
        const [lng, lat] = bestMatch.geometry.coordinates;

        setPosition([lat, lng]);
        setLocationName(bestMatch.properties.label);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Failed to fetch location");
    }
  };

  // Smooth Fly Animation with Dynamic Precision
  const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      map.flyTo(position, zoomLevel, { duration: 1.5, easeLinearity: 0.2 });
    }, [position]);
    return null;
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <h2 className="text-2xl font-bold text-center mb-4">Search for a Location</h2>

      {/* Search Bar */}
      <div className="flex justify-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getCoordinates()}
          className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 ${
            darkMode ? "bg-gray-700 text-white border border-gray-500 focus:ring-blue-400" : "bg-white text-black border border-gray-300 focus:ring-blue-500"
          }`}
        />
        <button onClick={getCoordinates} className="p-2 bg-blue-500 text-white rounded">
          Search
        </button>

        {/* Toggle Satellite View */}
        <button
          onClick={() => setSatelliteView(!satelliteView)}
          className="p-2 bg-gray-600 text-white rounded"
        >
          {satelliteView ? "Switch to Map View" : "Switch to Satellite"}
        </button>
      </div>

      {/* Map */}
      <MapContainer center={position} zoom={zoomLevel} style={{ height: "500px", width: "100%" }} scrollWheelZoom={true} maxZoom={20}>
        <MapFlyTo position={position} />

        {/* Switch between Satellite and Normal Map View */}
        <TileLayer
          url={
            satelliteView
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> & OpenStreetMap contributors'
        />

        {/* Custom Google Maps-style Marker */}
        <Marker position={position} icon={customMarker}>
          <Popup>
            <b>{locationName || "Selected Location"}</b>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default SearchableMap;
