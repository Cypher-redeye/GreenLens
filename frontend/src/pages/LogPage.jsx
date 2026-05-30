import React, { useState } from "react";
import { activitiesAPI, statsAPI } from "../api";
import { Slider } from "../components/Slider";

export const LogPage = () => {
  const [activity, setActivity] = useState("transport");
  const [value, setValue] = useState(0);
  const [unit, setUnit] = useState("km");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState("");
  const [co2Preview, setCo2Preview] = useState(0);
  const [imageHash, setImageHash] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [sdgGoal, setSdgGoal] = useState(null);

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
    setImageHash(null);
    setReceiptId(null);
    setSdgGoal(null);
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
        region: localStorage.getItem("globalRegion") || "IN",
        image_hash: imageHash,
        receipt_id: receiptId,
        sdg_goal: sdgGoal,
      });
      setSuccess("Activity logged successfully! 🌱");
      setValue(0);
      setCo2Preview(0);
      setImageHash(null);
      setReceiptId(null);
      setSdgGoal(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to log activity:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const res = await activitiesAPI.scan(file);
      const data = res.data;
      if (data && data.activity_type) {
        setActivity(data.activity_type);
        setUnit(data.unit || activityTypes[data.activity_type].units[0]);
        handleValueChange(data.value);
        if (data.image_hash) setImageHash(data.image_hash);
        if (data.receipt_id) setReceiptId(data.receipt_id);
        if (data.sdg_goal) setSdgGoal(data.sdg_goal);
        setSuccess("AI successfully analyzed your image! ✨");
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Scanning failed:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Failed to analyze image. Check API key or image format.");
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-deep px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-xl text-neon-green mb-2 text-center">
          Log Your Impact
        </h1>
        <p className="text-white/40 text-center mb-8 max-w-2xl">Takes under 60 seconds</p>

        <div className="card glass-mid">
          {success && (
            <div className="bg-emerald-bright/20 border border-emerald-bright text-emerald-glow px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* AI Scanner Section */}
          <div className="mb-8 p-6 glass-mid rounded-xl border border-emerald-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-green/5 animate-pulse-glow pointer-events-none"></div>
            <h2 className="heading-lg text-neon-green mb-6 flex items-center gap-2">
              <span className="text-2xl">📸</span> Gemini Vision Scan
            </h2>
            <p className="text-sm text-white/40 mb-4">
              Upload a grocery receipt or a meal photo. Our AI will automatically estimate its carbon footprint!
            </p>
            <label className="btn-secondary w-full flex justify-center items-center cursor-pointer relative z-10">
              {scanning ? "Analyzing Image..." : "Upload Image to Scan"}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleScan}
                disabled={scanning}
              />
            </label>
          </div>

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
                      ? "bg-emerald-bright text-deep glow-border"
                      : "bg-deep/50 border border-emerald-glow/30 hover:border-emerald-glow"
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
              className="w-full h-2 bg-deep/50 rounded-lg appearance-none cursor-pointer accent-emerald-glow"
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
            <div className="card glass-mid text-center py-4 text-white/40">
              <h1 className="heading-xl text-neon-green mb-2">🤖 Your AI Coach</h1>
              <div className="text-5xl font-bold text-neon-green">
                {co2Preview.toFixed(2)}
              </div>
              <div className="text-sm text-white/40 mt-2">kg CO₂ Impact</div>
              <div className="text-xs text-white/30 mt-1">
                = {(co2Preview / 21).toFixed(2)} trees
              </div>
            </div>
          </div>

          {sdgGoal && (
            <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center">
              <span className="text-2xl block mb-2">🌍</span>
              <p className="text-blue-200 text-sm font-semibold">Global Standard Alignment</p>
              <p className="text-blue-100 text-lg">{sdgGoal}</p>
            </div>
          )}

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
