import React, { useEffect, useState } from "react";
import { statsAPI, activitiesAPI, nudgesAPI } from "../api";
import { TrendingUp, Zap, Target, Trees, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, actRes, nudgesRes] = await Promise.all([
          statsAPI.getDashboard(),
          activitiesAPI.getList(50),
          nudgesAPI.getList(3),
        ]);
        setDashboard(dashRes.data);
        setActivities(actRes.data);
        setNudges(nudgesRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="pt-32 text-center text-emerald-glow animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="pt-32 text-center text-red-400">
        Failed to load dashboard. Please try refreshing.
      </div>
    );
  }

  // Build real weekly chart from actual activity data
  const weeklyMap = {};
  DAYS.forEach((d) => (weeklyMap[d] = 0));
  activities.forEach((a) => {
    const day = DAYS[new Date(a.created_at).getDay()];
    weeklyMap[day] = +(weeklyMap[day] + a.co2_kg).toFixed(2);
  });
  const weeklyData = DAYS.map((d) => ({ day: d, co2: weeklyMap[d] }));

  return (
    <div className="pt-24 min-h-screen bg-forest-dark px-4 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold glow-text">Your Carbon Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {dashboard.user?.username} 👋
            </p>
          </div>
          <div className="text-sm text-gray-400 bg-forest/50 border border-emerald-glow/20 rounded-lg px-4 py-2">
            Today's CO₂:{" "}
            <span className="text-emerald-glow font-bold">
              {dashboard.today_co2?.toFixed(2) ?? "0.00"} kg
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatBox
            icon={TrendingUp}
            value={dashboard.stats?.total_co2_kg?.toFixed(1) ?? "0.0"}
            label="Total CO₂ (kg)"
            color="text-emerald-glow"
          />
          <StatBox
            icon={Zap}
            value={dashboard.stats?.xp_points ?? 0}
            label="XP Points"
            color="text-yellow-400"
          />
          <StatBox
            icon={Activity}
            value={dashboard.stats?.streak_days ?? 0}
            label="Day Streak 🔥"
            color="text-orange-400"
          />
          <StatBox
            icon={TrendingUp}
            value={dashboard.stats?.trees_saved_equivalent ?? 0}
            label="🌲 Trees Saved"
            color="text-green-400"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📊 Weekly Emissions (This Week)</h2>
            {weeklyData.every((d) => d.co2 === 0) ? (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
                No activities logged this week yet. Start logging to see your chart!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF66" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(105, 240, 174, 0.1)" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#69F0AE" />
                  <YAxis stroke="#69F0AE" unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(4, 10, 5, 0.95)",
                      border: "1px solid #69F0AE",
                      borderRadius: "8px",
                    }}
                    formatter={(v) => [`${v} kg CO₂`, "Emissions"]}
                  />
                  <Bar dataKey="co2" fill="url(#colorCo2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">📋 Recent Activities</h2>
            {dashboard.recent_activities?.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-10">
                No activities logged yet.{" "}
                <a href="/log" className="text-emerald-glow underline">Log your first one!</a>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.recent_activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center border-b border-emerald-glow/20 pb-2"
                  >
                    <div>
                      <span className="capitalize font-medium">{activity.activity_type}</span>
                      <div className="text-xs text-gray-400">
                        {activity.value} {activity.unit} · {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-emerald-glow font-bold">
                      {activity.co2_kg} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
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

        {nudges.length === 0 && (
          <div className="card text-center py-8 text-gray-400 text-sm">
            🤖 Log an activity to get your first AI coach nudge!
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, value, label, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <div className={`text-3xl font-bold ${color ?? "glow-text"}`}>{value}</div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
      </div>
      <Icon className={`w-10 h-10 opacity-40 ${color ?? "text-emerald-glow"}`} />
    </div>
  </div>
);
