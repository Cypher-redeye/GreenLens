import React, { useState } from "react";
import { activitiesAPI, statsAPI } from "../api";
import { Slider } from "../components/Slider";
import { ArrowRight, Camera } from "lucide-react";

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
    electricity: { label: "Energy", units: ["kWh"], factor: 0.82 },
    purchases: { label: "Retail", units: ["items"], factor: 5.0 },
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
      setSuccess("Entry Recorded.");
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
        setSuccess("AI Analysis Complete.");
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
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
        
        {/* Left Column: Form */}
        <div className="w-full md:w-3/5 border-r border-[var(--border-fine)] flex flex-col">
          
          <div className="p-12 border-b border-[var(--border-thick)] bg-[var(--bg-surface)]">
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none mb-4">
              Log Data.
            </h1>
            <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
              Manual Entry or AI Receipt Scan
            </p>
          </div>

          <div className="p-12 border-b border-[var(--border-fine)] flex flex-col gap-12 bg-[var(--bg-paper)]">
            
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-6 text-[var(--text-ink)]">
                01 — Select Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-[var(--border-fine)]">
                {Object.entries(activityTypes).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => handleActivityChange(key)}
                    className={`py-4 text-xs font-bold uppercase tracking-widest border-r border-[var(--border-fine)] last:border-r-0 transition-colors ${
                      activity === key
                        ? "bg-[var(--text-ink)] text-[var(--bg-paper)]"
                        : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--border-fine)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Scanner */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-6 text-[var(--text-ink)]">
                02 — Or Automate with AI
              </label>
              <label className="border border-dashed border-[var(--border-thick)] bg-[var(--bg-surface)] hover:bg-[var(--accent)] transition-colors p-8 flex flex-col items-center justify-center cursor-pointer group">
                 <Camera className="w-8 h-8 mb-4 text-[var(--text-muted)] group-hover:text-[var(--text-ink)] transition-colors" />
                 <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)] text-center">
                   {scanning ? "Processing Image..." : "Upload Receipt or Photo"}
                 </span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleScan} disabled={scanning} />
              </label>
            </div>

            {/* Slider */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-6 text-[var(--text-ink)]">
                03 — Input Amount
              </label>
              <div className="flex items-end justify-between mb-4">
                <span className="font-mono-num text-4xl font-bold">{value.toFixed(1)}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">{unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={value}
                onChange={(e) => handleValueChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[var(--border-fine)] appearance-none cursor-pointer mb-6"
              />
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 75, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleValueChange(v)}
                    className="px-4 py-2 border border-[var(--border-fine)] bg-[var(--bg-surface)] text-xs font-bold font-mono-num hover:border-[var(--text-ink)] transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Output / Submission */}
        <div className="w-full md:w-2/5 flex flex-col bg-[var(--bg-surface)] relative">
          
          <div className="flex-1 p-12 border-b border-[var(--border-thick)] flex flex-col justify-center items-center text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8">
              Estimated Footprint
            </h2>
            <div className="font-mono-num text-8xl md:text-[8rem] font-bold tracking-tighter leading-none">
              {co2Preview.toFixed(1)}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)] mt-4">
              KG CO₂ Equivalent
            </div>

            {sdgGoal && (
               <div className="mt-12 p-4 border border-[var(--text-ink)] bg-[var(--accent)] text-[var(--text-ink)] inline-block">
                 <p className="text-xs font-bold uppercase tracking-widest mb-1">Aligned Standard</p>
                 <p className="text-sm font-serif italic font-bold">{sdgGoal}</p>
               </div>
            )}

            {success && (
               <div className="mt-12 text-sm font-bold uppercase tracking-widest text-green-600 border border-green-600 p-4">
                 {success}
               </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || value === 0}
            className="w-full py-10 bg-[var(--text-ink)] text-[var(--bg-paper)] text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[var(--accent)] hover:text-[var(--text-ink)] transition-colors disabled:opacity-50 disabled:hover:bg-[var(--text-ink)] disabled:hover:text-[var(--bg-paper)]"
          >
            {loading ? "Recording..." : "Submit Entry"} <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
