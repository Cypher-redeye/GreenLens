import React, { useState } from "react";
import { activitiesAPI, statsAPI } from "../api";
import { Slider } from "../components/Slider";

export const LogPage = () => {
  const [activity, setActivity] = useState("transport");
  const [value, setValue] = useState(0);
  const [unit, setUnit] = useState("km");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [co2Preview, setCo2Preview] = useState(0);

  const activityTypes = {
    transport: { label: "Transport", units: ["km"], factor: 0.19 },
    food: { label: "Food", units: ["meal"], factor: 1.2 },
    electricity: { label: "Electricity", units: ["kWh"], factor: 0.82 },
    purchases: { label: "Purchases", units: ["items"], factor: 5.0 },
    waste: { label: "Waste", units: ["kg"], factor: 2.5 },
  };

  const handleActivityChange = (type) => {
    setActivity(type);
    setUnit(activityTypes[type].units[0]);
    setValue(0);
    setCo2Preview(0);
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    const preview = newValue * (activityTypes[activity]?.factor || 1);
    setCo2Preview(preview);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await activitiesAPI.log({
        activity_type: activity,
        value,
        unit,
        description: `Logged ${activity} activity`,
      });
      setSuccess("Activity logged successfully! 🌱");
      setValue(0);
      setCo2Preview(0);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to log activity:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-forest px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-2 text-center">
          Log Your Impact
        </h1>
        <p className="text-gray-300 text-center mb-8">Takes under 60 seconds</p>

        <div className="card">
          {success && (
            <div className="bg-emerald-bright/20 border border-emerald-bright text-emerald-glow px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Activity Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-4">
              What did you do?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(activityTypes).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => handleActivityChange(key)}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    activity === key
                      ? "bg-emerald-bright text-forest glow-border"
                      : "bg-forest/50 border border-emerald-glow/30 hover:border-emerald-glow"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Slider */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-4">
              Amount: {value.toFixed(1)} {unit}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={value}
              onChange={(e) => handleValueChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-forest/50 rounded-lg appearance-none cursor-pointer accent-emerald-glow"
            />
            <div className="flex gap-2 mt-4">
              {[10, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => handleValueChange(v)}
                  className="px-3 py-1 bg-emerald-glow/20 border border-emerald-glow text-emerald-glow rounded text-sm hover:bg-emerald-glow/40"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* CO2 Preview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-bright/10 to-emerald-glow/10 rounded-lg border border-emerald-glow/30">
            <div className="text-center">
              <div className="text-5xl font-bold glow-text">
                {co2Preview.toFixed(2)}
              </div>
              <div className="text-sm text-gray-300 mt-2">kg CO₂ Impact</div>
              <div className="text-xs text-gray-400 mt-1">
                = {(co2Preview / 21).toFixed(2)} trees
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || value === 0}
            className="btn-primary w-full disabled:opacity-50 text-lg py-4 font-bold"
          >
            {loading ? "Logging..." : "Log Activity ✨"}
          </button>
        </div>
      </div>
    </div>
  );
};
