import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { campusAPI, activitiesAPI } from "../api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
          activitiesAPI.getList(30, true),
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
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Loading Impact...</div>
      </div>
    );
  }

  if (!campusStats) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-[var(--bg-paper)] text-red-600 font-bold uppercase tracking-widest text-xs">
        Failed to load impact data.
      </div>
    );
  }

  const sorted = [...activities].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
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
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <div className="p-12 border-b border-[var(--border-thick)] bg-[var(--bg-surface)]">
          <p className="font-mono-num text-[var(--text-muted)] text-sm tracking-widest uppercase mb-4">
            GLOBAL.GRID // {campusStats.campus.toUpperCase()}
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none mb-4">
            Campus Impact.
          </h1>
          <p className="text-[var(--text-muted)] text-xl font-medium max-w-2xl">
            Real data. Real change. The collective footprint of your organization.
          </p>
        </div>

        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[var(--border-thick)] bg-[var(--bg-paper)]">
          <div className="p-12 border-b md:border-b-0 md:border-r border-[var(--border-fine)] flex flex-col justify-between">
             <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8 flex items-center justify-between">
                Trees Equivalent <Leaf className="w-5 h-5 text-[var(--text-ink)]" />
             </div>
             <div>
               <div className="font-mono-num text-6xl font-bold tracking-tighter mb-2">{campusStats.trees_equivalent}</div>
               <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Planted This Term</div>
             </div>
          </div>
          <div className="p-12 border-b md:border-b-0 md:border-r border-[var(--border-fine)] flex flex-col justify-between">
             <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8 flex items-center justify-between">
                CO₂ Tracked <TrendingDown className="w-5 h-5 text-[var(--text-ink)]" />
             </div>
             <div>
               <div className="font-mono-num text-6xl font-bold tracking-tighter mb-2">{campusStats.total_co2_kg.toFixed(1)}</div>
               <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Kilograms</div>
             </div>
          </div>
          <div className="p-12 flex flex-col justify-between bg-[var(--accent)]">
             <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] mb-8 flex items-center justify-between">
                Eco Warriors <Users className="w-5 h-5 text-[var(--text-ink)]" />
             </div>
             <div>
               <div className="font-mono-num text-6xl font-bold tracking-tighter mb-2">{campusStats.students_tracking}</div>
               <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Active Members</div>
             </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-12 border-b border-[var(--border-thick)] bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold">Cumulative Journey</h2>
              <p className="text-[var(--text-muted)] mt-2">Based on your last {activities.length} activities</p>
            </div>
          </div>
          
          {journeyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
               No activities logged yet.
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={journeyData}>
                  <defs>
                    <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--text-ink)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--text-ink)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-fine)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} dx={-10} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-paper)",
                      border: "1px solid var(--text-ink)",
                      borderRadius: "0px",
                      fontFamily: "Inter"
                    }}
                    itemStyle={{ color: "var(--text-ink)", fontWeight: "bold", fontFamily: "JetBrains Mono" }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="var(--text-ink)" strokeWidth={2} fill="url(#co2Gradient)" dot={{ fill: "var(--bg-surface)", stroke: "var(--text-ink)", r: 4, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Mission */}
        <div className="p-12 bg-[var(--text-ink)] text-[var(--bg-paper)]">
          <h2 className="text-3xl font-display font-bold mb-6">The Mission.</h2>
          <p className="text-lg font-medium leading-relaxed max-w-4xl opacity-90">
            GreenLens empowers modern enterprises to understand and systematically reduce their carbon footprint. Together, we are building a culture of radical accountability—one logged activity at a time. Every action is measured, every member matters, and every campus can drive global change.
          </p>
        </div>

      </div>
    </div>
  );
};
