import React, { useEffect, useState } from "react";
import { statsAPI, activitiesAPI, nudgesAPI } from "../api";
import { TrendingUp, Zap, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, nudgesRes] = await Promise.all([
          statsAPI.getDashboard(),
          nudgesAPI.getList(3),
        ]);
        setDashboard(dashRes.data);
        setNudges(nudgesRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="pt-32 text-center text-emerald-glow">
        Loading dashboard...
      </div>
    );
  }

  const weeklyData = [
    { day: "Mon", co2: 2.5 },
    { day: "Tue", co2: 3.2 },
    { day: "Wed", co2: 2.8 },
    { day: "Thu", co2: 4.1 },
    { day: "Fri", co2: 3.5 },
    { day: "Sat", co2: 2.0 },
    { day: "Sun", co2: 1.8 },
  ];

  return (
    <div className="pt-24 min-h-screen bg-forest px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-8">
          Your Carbon Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatBox
            icon={TrendingUp}
            value={dashboard.stats.total_co2_kg.toFixed(1)}
            label="Total CO₂ (kg)"
          />
          <StatBox
            icon={Zap}
            value={dashboard.stats.xp_points}
            label="XP Points"
          />
          <StatBox
            icon={Target}
            value={dashboard.stats.streak_days}
            label="Day Streak"
          />
          <StatBox
            icon={Target}
            value={dashboard.stats.trees_saved_equivalent}
            label="Trees Saved"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Weekly Emissions</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="#69F0AE40" />
                <XAxis dataKey="day" stroke="#69F0AE" />
                <YAxis stroke="#69F0AE" />
                <Tooltip
                  contentStyle={{
                    background: "#0D1F0F",
                    border: "1px solid #69F0AE",
                  }}
                />
                <Bar dataKey="co2" fill="#69F0AE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Activity Breakdown</h2>
            <div className="space-y-3">
              {dashboard.recent_activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex justify-between items-center border-b border-emerald-glow/20 pb-2"
                >
                  <span className="capitalize">{activity.activity_type}</span>
                  <span className="text-emerald-glow font-bold">
                    {activity.co2_kg} kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Nudges */}
        {nudges.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🤖 AI Coach Nudges</h2>
            <div className="space-y-3">
              {nudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className="bg-emerald-bright/10 border-l-4 border-emerald-bright p-4 rounded"
                >
                  <p className="text-sm">{nudge.content}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(nudge.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, value, label }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold glow-text">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
      <Icon className="w-12 h-12 text-emerald-glow/50" />
    </div>
  </div>
);
