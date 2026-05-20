import React, { useEffect, useState } from "react";
import { campusAPI } from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Leaf, TrendingDown } from "lucide-react";

export const ImpactPage = () => {
  const [campusStats, setCampusStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await campusAPI.getStats();
        setCampusStats(res.data);
      } catch (err) {
        console.error("Failed to fetch campus stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !campusStats) {
    return (
      <div className="pt-32 text-center text-emerald-glow">
        Loading impact data...
      </div>
    );
  }

  const journeyData = [
    { day: 1, trees: 0, co2: 0 },
    { day: 5, trees: 2, co2: 42 },
    { day: 10, trees: 5, co2: 105 },
    { day: 15, trees: 8, co2: 168 },
    { day: 20, trees: 12, co2: 252 },
    { day: 25, trees: 16, co2: 336 },
    {
      day: 30,
      trees: campusStats.trees_equivalent,
      co2: campusStats.total_co2_kg,
    },
  ];

  return (
    <div className="pt-24 min-h-screen bg-forest px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-2">🌍 Campus Impact</h1>
        <p className="text-gray-300 mb-8">
          Your collective change is happening
        </p>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ImpactCard
            icon={Leaf}
            value={campusStats.trees_equivalent}
            label="Trees Saved"
            desc="Equivalent trees planted"
          />
          <ImpactCard
            icon={TrendingDown}
            value={campusStats.total_co2_kg.toFixed(0)}
            label="CO₂ Averted"
            desc="kg of carbon"
          />
          <ImpactCard
            icon={Leaf}
            value={campusStats.students_tracking}
            label="Eco Warriors"
            desc="Active participants"
          />
        </div>

        {/* 30-Day Journey */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">
            30-Day Sustainability Journey
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={journeyData}>
              <CartesianGrid stroke="#69F0AE40" />
              <XAxis dataKey="day" stroke="#69F0AE" />
              <YAxis stroke="#69F0AE" />
              <Tooltip
                contentStyle={{
                  background: "#0D1F0F",
                  border: "1px solid #69F0AE",
                }}
              />
              <Line
                type="monotone"
                dataKey="trees"
                stroke="#69F0AE"
                strokeWidth={3}
                dot={{ fill: "#69F0AE", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mission */}
        <div className="card bg-gradient-to-r from-emerald-bright/10 to-emerald-glow/10 border-emerald-bright">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-200 leading-relaxed">
            GreenLens empowers Indian college students to understand and reduce
            their personal carbon footprint. Together, we're building a culture
            of sustainability one logged activity at a time. Every action
            counts, every student matters, and every campus can change.
          </p>
        </div>
      </div>
    </div>
  );
};

const ImpactCard = ({ icon: Icon, value, label, desc }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-10 h-10 text-emerald-glow" />
    </div>
    <div className="text-4xl font-bold glow-text mb-2">{value}</div>
    <div className="font-bold text-white mb-1">{label}</div>
    <div className="text-xs text-gray-400">{desc}</div>
  </div>
);
