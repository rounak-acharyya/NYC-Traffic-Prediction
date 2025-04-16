// components/ui/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaChartLine, FaMapMarkedAlt, FaHistory, FaCog, FaMoon, FaSun } from "react-icons/fa";

const Sidebar = ({ toggleTheme, darkMode }) => (
  <div className={`w-64 h-screen p-6 flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-200 text-black"}`}>
    <h2 className="text-3xl font-bold mb-6 text-center">Traffic AI</h2>
    <nav className="space-y-4">
      {[
        { to: "/", icon: <FaHome />, label: "Home" },
        { to: "/search-map", icon: <FaMapMarkedAlt />, label: "Search Map" },
        { to: "/analytics", icon: <FaChartLine />, label: "Analytics" },
        { to: "/map", icon: <FaMapMarkedAlt />, label: "Route Optimization" },
        { to: "/history", icon: <FaHistory />, label: "History" },
        { to: "/settings", icon: <FaCog />, label: "Settings" },
      ].map(({ to, icon, label }) => (
        <NavLink 
          key={to} 
          className={({ isActive }) => `flex items-center space-x-2 p-2 rounded transition-all duration-300 ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700 hover:bg-opacity-80"}`} 
          to={to} 
          end
        >
          {icon} <span>{label}</span>
        </NavLink>
      ))}
    </nav>
    <button className="mt-auto flex items-center space-x-2 p-2 hover:bg-gray-700 rounded transition-all duration-300" onClick={toggleTheme}>
      {darkMode ? <FaSun /> : <FaMoon />} <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
    </button>
  </div>
);

export default Sidebar;
