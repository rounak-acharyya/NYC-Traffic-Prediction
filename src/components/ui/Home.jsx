// components/ui/Home.jsx
import React from "react";
import img4 from '/src/assets/Images/img4.jpg';
import img3 from '/src/assets/Images/img3.jpg';

const Home = () => (
    <div className="p-6 w-full">
      <h1 className="text-5xl font-extrabold text-center relative tracking-wider leading-relaxed">
        <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-transparent bg-clip-text">
          Welcome to
        </span>
        <br />
        <span className="relative inline-block px-4">
          <span className="text-white bg-black px-5 py-2 rounded-lg shadow-lg">
            🚦 Traffic AI 🚗
          </span>
          <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1 animate-pulse"></span>
        </span>
      </h1>
  
      <p className="text-xl text-center text-gray-300 tracking-wide leading-relaxed mt-4 mb-10">
        <span className="relative px-3 py-1 bg-gray-900 rounded-lg shadow-md">
           <span className="text-green-400">Revolutionizing</span> Traffic Management 
          <span className="text-yellow-400"> with AI-Powered</span> Insights 
        </span>
      </p>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-2xl p-10 rounded-lg border border-gray-400 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">Why Choose Traffic AI?</h2>
          <ul className="list-disc list-inside text-gray-700 font-medium">
            <li>Real-time Traffic Monitoring</li>
            <li>AI-based Route Optimization</li>
            <li>Accident and Congestion Alerts</li>
            <li>Data-Driven Decision Making</li>
            <li>Smart Traffic Forecasting</li>
            <li>Integration with Navigation Systems</li>
          </ul>
        </div>
        <div className="bg-white shadow-2xl p-10 rounded-lg border border-gray-400 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">User Success Stories</h2>
          <p className="mb-4 italic text-gray-700">"Traffic AI has drastically reduced my travel time! The congestion alerts are a lifesaver."</p>
          <p className="mb-4 italic text-gray-700">"The AI-powered insights helped me choose the fastest routes and avoid roadblocks effectively."</p>
          <span className="block text-right font-semibold text-gray-900">- Alex, Daily Commuter</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-2xl p-10 rounded-lg border border-gray-400 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">Advanced Features</h2>
          <ul className="list-disc list-inside text-gray-700 font-medium">
            <li>Predictive Traffic Analysis</li>
            <li>Customizable Traffic Reports</li>
            <li>Live Data Synchronization</li>
            <li>Multi-Modal Transportation Insights</li>
          </ul>
        </div>
        <div className="bg-white shadow-2xl p-10 rounded-lg border border-gray-400 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">How It Works?</h2>
          <p className="text-gray-700">Our AI processes real-time data from multiple sources to provide accurate congestion predictions and optimal route suggestions.</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-8">
    <img 
      src={img4} 
      alt="Traffic AI Dashboard" 
      className="rounded-2xl shadow-2xl w-1/2 h-80 object-cover border-4 border-gray-300 p-2 
                 bg-gradient-to-br from-blue-500 to-green-500 transition-transform duration-500 
                 transform hover:scale-110 hover:rotate-2 hover:shadow-3xl"
    />
    <img 
      src={img3} 
      alt="Traffic AI Dashboard" 
      className="rounded-2xl shadow-2xl w-1/2 h-80 object-cover border-4 border-gray-300 p-2 
                 bg-gradient-to-br from-blue-500 to-green-500 transition-transform duration-500 
                 transform hover:scale-110 hover:rotate-2 hover:shadow-3xl"
    />
  </div>
  
  
  
    </div>
  );

export default Home;