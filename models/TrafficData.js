const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"], // GeoJSON format
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  congestion: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
  },
  speed: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

// ✅ Create GeoIndex for efficient location-based queries
trafficSchema.index({ location: "2dsphere" });

const TrafficData = mongoose.model("TrafficData", trafficSchema);

module.exports = TrafficData;
