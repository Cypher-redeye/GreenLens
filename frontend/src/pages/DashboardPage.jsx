import React, { useEffect, useState } from "react";
import { statsAPI, activitiesAPI, nudgesAPI } from "../api";
import { ArrowRight, Activity, Flame, TreePine, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    <div className="bg-[var(--text-ink)] text-[var(--bg-paper)] p-4 border border-[var(--border-thick)] rounded-none shadow-2xl">
      <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="font-mono-num font-bold text-lg">
        {payload[0].value} <span className="text-xs font-sans">KG CO₂</span>
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
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Loading Ledger...</div>
      </div>
    );
  }

  if (!dashboard) return (
    <div className="min-h-screen pt-32 flex justify-center bg-[var(--bg-paper)] text-red-600 font-bold uppercase tracking-widest text-xs">
      Failed to load dashboard.
    </div>
  );

  const weeklyMap = Object.fromEntries(DAYS.map(d => [d, 0]));
  activities.forEach(a => {
    const d = DAYS[new Date(a.created_at).getDay()];
    weeklyMap[d] = +(weeklyMap[d] + a.co2_kg).toFixed(2);
  });
  const weeklyData = DAYS.map(d => ({ day: d, co2: weeklyMap[d] }));
  const streak = dashboard.stats?.streak_days ?? 0;
  const recent = dashboard.recent_activities ?? [];

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <div className="p-12 border-b border-[var(--border-thick)] flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-[var(--bg-surface)]">
          <div>
            <p className="font-mono-num text-[var(--text-muted)] text-sm tracking-widest uppercase mb-4">
              USER.ID // {dashboard.user?.username}
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none">
              Overview.
            </h1>
          </div>
          <Link to="/log" className="btn-primary">
            Log Activity <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        {/* Swiss Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[var(--border-thick)]">
          
          {/* Main KPI */}
          <div className="col-span-1 md:col-span-2 p-12 border-b md:border-b-0 md:border-r border-[var(--border-fine)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Lifetime Footprint</span>
              <Activity className="w-5 h-5 text-[var(--text-ink)]" />
            </div>
            <div>
              <div className="font-mono-num text-7xl md:text-9xl font-bold tracking-tighter leading-none mb-2">
                {totalCo2.toFixed(1)}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Kilograms of CO₂</div>
            </div>
          </div>

          {/* Sub KPIs */}
          <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-[var(--border-fine)] grid grid-rows-2">
            <div className="p-8 border-b border-[var(--border-fine)] flex flex-col justify-between bg-[var(--accent)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)]">Experience</span>
              <div className="font-mono-num text-5xl font-bold mt-4">{Math.round(xp)}</div>
            </div>
            <div className="p-8 flex flex-col justify-between bg-[#FF4D00] text-[#F7F5F0]">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Current Streak</span>
              <div className="font-mono-num text-5xl font-bold mt-4">{streak}</div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 p-8 flex flex-col justify-between bg-[var(--bg-surface)]">
             <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Trees Saved</span>
              <TreePine className="w-5 h-5 text-[var(--text-ink)]" />
            </div>
            <div className="font-mono-num text-6xl font-bold tracking-tighter">
              {Math.round(trees)}
            </div>
          </div>

        </div>

        {/* Charts & Feed */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* Chart */}
          <div className="col-span-1 md:col-span-2 p-12 border-b md:border-b-0 md:border-r border-[var(--border-fine)] bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold uppercase tracking-wide">Weekly Ledger</h2>
              <span className="pill">Current</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={40}>
                  <CartesianGrid stroke="var(--border-fine)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(11,18,14,0.03)" }} />
                  <Bar dataKey="co2" fill="var(--text-ink)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feed */}
          <div className="col-span-1 p-12 flex flex-col bg-[var(--bg-paper)]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest">Recent Activity</h2>
              <Link to="/log" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-ink)] border-b border-transparent hover:border-[var(--text-ink)]">View All</Link>
            </div>
            <div className="space-y-6 flex-1">
              {recent.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start justify-between pb-4 border-b border-[var(--border-fine)]">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest">{a.activity_type}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono-num mt-1">
                      {a.value} {a.unit}
                    </div>
                  </div>
                  <span className="font-mono-num text-sm font-bold bg-[var(--accent)] px-2 py-1">
                    +{a.co2_kg} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* Nudge Banner */}
        {nudges.length > 0 && (
          <div className="border-t border-[var(--border-thick)] bg-[var(--text-ink)] text-[var(--bg-paper)] p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="max-w-3xl">
               <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">AI Analysis</div>
               <p className="text-lg font-medium leading-relaxed">{nudges[0].content}</p>
            </div>
            <Link to="/coach" className="btn-primary" style={{ background: 'var(--bg-paper)', color: 'var(--text-ink)', borderColor: 'var(--bg-paper)' }}>
              Open Coach
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
