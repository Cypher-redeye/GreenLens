import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { campusAPI, activitiesAPI } from "../api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Leaf, TrendingDown, Users } from "lucide-react";

export const ImpactPage = () => {
  const [campusStats, setCampusStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [campusRes, actRes] = await Promise.all([
          campusAPI.getStats(),
          activitiesAPI.getList(30),
        ]);
        setCampusStats(campusRes.data);
        setActivities(actRes.data);
      } catch (err) {
        console.error("Failed to fetch impact data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center text-emerald-glow animate-pulse">
        Loading impact data...
      </div>
    );
  }

  if (!campusStats) {
    return (
      <div className="pt-32 text-center text-red-400">
        Failed to load impact data.
      </div>
    );
  }

  // Build real cumulative CO₂ chart from actual activities (sorted by date)
  const sorted = [...activities].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  let cumulative = 0;
  const journeyData = sorted.map((a) => {
    cumulative = +(cumulative + a.co2_kg).toFixed(2);
    return {
      label: new Date(a.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      co2: cumulative,
      trees: +(cumulative / 21).toFixed(2),
    };
  });

  return (
    <div className="pt-24 min-h-screen bg-deep px-4 pb-10">
      <div className="max-w-6xl mx-auto">
          <h1 className="heading-xl text-neon-green mb-2">🌍 Campus Impact</h1>
          <p className="text-white/40 mb-8 max-w-2xl">Real data. Real change. Parul University live stats.</p>

        {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ImpactCard
              icon={Leaf}
              value={campusStats.trees_equivalent}
              label="Trees Saved"
              desc="Equivalent trees planted this semester"
            />
            <ImpactCard
              icon={TrendingDown}
              value={`${campusStats.total_co2_kg.toFixed(1)} kg`}
              label="CO₂ Tracked"
              desc="Total carbon footprint logged"
            />
            <ImpactCard
              icon={Users}
              value={campusStats.students_tracking}
              label="Eco Warriors"
              desc="Active students participating"
            />
          </div>

        {/* Real Cumulative CO₂ Journey */}
        <div className="card mb-8">
          <h2 className="heading-lg text-neon-green mb-2">Your Cumulative CO₂ Journey</h2>
          <p className="text-white/50 mb-6">
            Based on your last {activities.length} logged activities
          </p>
          {journeyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
               No activities logged yet.
               <Link to="/log" className="text-neon-green underline ml-1">
                 Start logging to see your impact!
               </Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={journeyData}>
                <defs>
                  <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#69F0AE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#69F0AE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(105, 240, 174, 0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#69F0AE" tick={{ fontSize: 11 }} />
                <YAxis stroke="#69F0AE" unit=" kg" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(4, 10, 5, 0.95)",
                    border: "1px solid #69F0AE",
                    borderRadius: "8px",
                  }}
                  formatter={(v, name) => [
                    name === "co2" ? `${v} kg CO₂` : `${v} trees`,
                    name === "co2" ? "Cumulative CO₂" : "Trees Equivalent",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="co2"
                  stroke="#69F0AE"
                  strokeWidth={3}
                  fill="url(#co2Gradient)"
                  dot={{ fill: "#69F0AE", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mission */}
          <div className="card glass-mid">
            <h2 className="heading-lg text-neon-green mb-4">🌱 Our Mission</h2>
            <p className="text-white/40 leading-relaxed">
              GreenLens empowers Indian college students to understand and reduce
              their personal carbon footprint. Together, we're building a culture
              of sustainability — one logged activity at a time. Every action
              counts, every student matters, and every campus can change.
            </p>
          </div>
      </div>
    </div>
  );
};

const ImpactCard = ({ icon: Icon, value, label, desc }) => (
  <div className="card glass-mid">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-8 h-8 text-neon-green" />
      <span className="text-sm text-white/30 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-4xl font-bold text-neon-green mb-2">{value}</div>
    <div className="text-xs text-white/40">{desc}</div>
  </div>
);
