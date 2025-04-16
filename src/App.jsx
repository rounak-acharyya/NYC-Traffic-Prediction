import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/ui/Sidebar";
import Home from "./components/ui/Home";
import MapView from "./components/ui/MapView";
import SearchableMap from "./components/ui/SearchableMap";
import Dashboard from "./components/ui/Dashboard";

const App = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Router>
      <div className={`flex min-h-screen ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
        <Sidebar toggleTheme={() => setDarkMode(!darkMode)} darkMode={darkMode} />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapView darkMode={darkMode} />} />
            <Route path="/analytics" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/history" element={<div>History Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path="/search-map" element={<SearchableMap darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
