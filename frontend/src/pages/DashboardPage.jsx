import React, { useEffect, useState } from "react";
import { statsAPI, activitiesAPI, nudgesAPI } from "../api";
import { TrendingUp, Zap, Flame, Trees, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Animated counter hook */
function useCounter(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(parseFloat(cur.toFixed(2)));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return count;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-mid rounded-xl px-4 py-3 text-sm">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="font-mono-num font-semibold text-neon-green">
        {payload[0].value} kg CO₂
      </p>
    </div>
  );
};

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsAPI.getDashboard(),
      activitiesAPI.getList(50),
      nudgesAPI.getList(3),
    ])
      .then(([dash, act, nud]) => {
        setDashboard(dash.data);
        setActivities(act.data);
        setNudges(nud.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalCo2 = useCounter(dashboard?.stats?.total_co2_kg ?? 0);
  const xp       = useCounter(dashboard?.stats?.xp_points ?? 0);
  const trees    = useCounter(dashboard?.stats?.trees_saved_equivalent ?? 0);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center gap-4 text-white/30">
        <div className="w-8 h-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  if (!dashboard) return (
    <div className="pt-32 text-center text-red-400 text-sm">
      Failed to load dashboard. Please refresh.
    </div>
  );

  /* Build real weekly chart */
  const weeklyMap = Object.fromEntries(DAYS.map(d => [d, 0]));
  activities.forEach(a => {
    const d = DAYS[new Date(a.created_at).getDay()];
    weeklyMap[d] = +(weeklyMap[d] + a.co2_kg).toFixed(2);
  });
  const weeklyData = DAYS.map(d => ({ day: d, co2: weeklyMap[d] }));

  const streak = dashboard.stats?.streak_days ?? 0;
  const todayCo2 = dashboard.today_co2?.toFixed(2) ?? "0.00";
  const recent = dashboard.recent_activities ?? [];

  const TYPE_ICON = {
    transport: "🚗",
    food: "🍽️",
    electricity: "⚡",
    purchases: "🛍️",
    waste: "♻️",
  };

  return (
    <div className="min-h-screen bg-deep pt-16 pb-12 px-4 relative">

      {/* Glow blobs */}
      <div className="glow-blob glow-blob-green w-96 h-96 top-0 left-0" />
      <div className="glow-blob glow-blob-gold w-72 h-72 bottom-20 right-0" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between py-8">
          <div>
            <h1 className="heading-lg text-white">
              Hey, {dashboard.user?.username} 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Here's your carbon footprint at a glance
            </p>
          </div>
          <Link to="/log" className="btn-primary">
            <Zap className="w-4 h-4" /> Log Activity
          </Link>
        </div>

        {/* ── Bento Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4 auto-rows-auto">

          {/* Total CO₂ — wide */}
          <div className="col-span-12 md:col-span-4 card flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30 uppercase tracking-widest">Total CO₂</span>
              <TrendingUp className="w-4 h-4 text-neon-green opacity-50" />
            </div>
            <div>
              <div className="font-mono-num text-5xl font-bold text-neon-green leading-none">
                {totalCo2.toFixed(1)}
              </div>
              <div className="text-xs text-white/30 mt-1">kg tracked lifetime</div>
            </div>
            <div className="pill pill-green self-start mt-3">
              Today: {todayCo2} kg
            </div>
          </div>

          {/* XP */}
          <div className="col-span-6 md:col-span-2 card-gold flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30 uppercase tracking-widest">XP</span>
              <Zap className="w-4 h-4 text-gold opacity-50" />
            </div>
            <div className="font-mono-num text-4xl font-bold text-gold">{Math.round(xp)}</div>
            <div className="text-xs text-white/30 mt-1">points earned</div>
          </div>

          {/* Streak */}
          <div className="col-span-6 md:col-span-2 card flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30 uppercase tracking-widest">Streak</span>
              <Flame className="w-4 h-4 text-orange-400 opacity-50" />
            </div>
            <div className="font-mono-num text-4xl font-bold text-orange-400">{streak}</div>
            <div className="text-xs text-white/30 mt-1">days in a row 🔥</div>
          </div>

          {/* Trees */}
          <div className="col-span-12 md:col-span-4 card flex flex-col justify-between min-h-[140px]"
            style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.15)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30 uppercase tracking-widest">Trees Saved</span>
              <span className="text-green-400 opacity-50 text-lg">🌲</span>
            </div>
            <div className="font-mono-num text-5xl font-bold text-green-400">{Math.round(trees)}</div>
            <div className="text-xs text-white/30 mt-1">equivalent trees planted</div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="col-span-12 lg:col-span-7 card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white">Weekly Emissions</h2>
                <p className="text-xs text-white/30 mt-0.5">CO₂ kg per day this week</p>
              </div>
              {weeklyData.every(d => d.co2 === 0) && (
                <span className="pill pill-green text-xs">No data yet</span>
              )}
            </div>
            {weeklyData.every(d => d.co2 === 0) ? (
              <div className="h-48 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
                <span className="text-3xl">📊</span>
                Start logging to see your chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barSize={28}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5EFFA0" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#5EFFA0" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" kg" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="co2" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Activities */}
          <div className="col-span-12 lg:col-span-5 card flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-white">Recent Activities</h2>
              <Link to="/log" className="text-xs text-neon-green/60 hover:text-neon-green flex items-center gap-1 transition-colors">
                Add new <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
                <span className="text-3xl">🌱</span>
                No activities yet
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {recent.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{TYPE_ICON[a.activity_type] ?? "📌"}</span>
                      <div>
                        <div className="text-sm font-medium capitalize text-white/80">{a.activity_type}</div>
                        <div className="text-xs text-white/30">
                          {a.value} {a.unit} · {new Date(a.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-num text-sm font-semibold text-neon-green">
                      {a.co2_kg} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Nudges */}
          {nudges.length > 0 && (
            <div className="col-span-12 card"
              style={{ background: "rgba(105, 240, 174, 0.03)", borderColor: "rgba(105, 240, 174, 0.1)" }}>
              <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                🤖 <span>Latest AI Coach Nudge</span>
                <span className="pill pill-green">Gemini</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">{nudges[0].content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-white/25">{new Date(nudges[0].created_at).toLocaleString()}</span>
                <Link to="/coach" className="text-xs text-neon-green/60 hover:text-neon-green transition-colors flex items-center gap-1">
                  See all nudges <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
