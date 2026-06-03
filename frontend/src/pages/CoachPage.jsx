import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { statsAPI, nudgesAPI } from "../api";
import { CheckCircle } from "lucide-react";

export const CoachPage = () => {
  const [stats, setStats] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, nudgesRes] = await Promise.all([
          statsAPI.getStats(),
          nudgesAPI.getList(10),
        ]);
        setStats(statsRes.data);
        setNudges(nudgesRes.data);
      } catch (err) {
        console.error("Failed to fetch coach data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkRead = async (nudgeId) => {
    try {
      await nudgesAPI.markRead(nudgeId);
      setNudges((prev) =>
        prev.map((n) => (n.id === nudgeId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark nudge as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Consulting AI Coach...</div>
      </div>
    );
  }

  const generateTips = () => {
    if (!stats) return [];
    const tips = [];
    if (stats.xp_points === 0) tips.push({ id: 1, text: "Welcome. Log your first activity to initiate AI tracking." });
    if (stats.xp_points > 0 && stats.xp_points < 50) tips.push({ id: 2, text: `Current XP: ${stats.xp_points}. Log 5 activities to unlock primary badge.` });
    if (stats.weekly_co2_kg > 50) tips.push({ id: 3, text: `Warning: Weekly CO₂ is ${stats.weekly_co2_kg.toFixed(1)} kg. Optimize transport emissions to reduce footprint.` });
    if (stats.weekly_co2_kg > 0 && stats.weekly_co2_kg <= 20) tips.push({ id: 4, text: `Optimal Status: ${stats.weekly_co2_kg.toFixed(1)} kg CO₂ this week. Top 10% eco efficiency.` });
    if (stats.streak_days >= 7) tips.push({ id: 5, text: `${stats.streak_days}-day streak maintained. Consistency yields maximum XP.` });
    if (stats.trees_saved_equivalent > 0) tips.push({ id: 6, text: `Impact Verified: ${stats.trees_saved_equivalent} tree equivalent saved.` });
    return tips;
  };

  const tips = generateTips();

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
        
        {/* Left Column: Diagnostics */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-[var(--border-fine)] flex flex-col bg-[var(--bg-surface)]">
          <div className="p-12 border-b border-[var(--border-thick)] bg-[var(--accent)] text-[var(--text-ink)]">
             <p className="font-mono-num text-[var(--text-ink)] text-sm tracking-widest uppercase mb-4 opacity-80">
              AI // DIAGNOSTICS
            </p>
            <h1 className="text-5xl font-display font-black tracking-tight leading-none mb-4">
              The Coach.
            </h1>
            <p className="font-medium text-sm">Automated insights based on your telemetry.</p>
          </div>

          <div className="p-12 flex-1">
             <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8">System Analysis</h2>
             
             <div className="space-y-6">
                {tips.length === 0 ? (
                  <p className="text-sm font-bold uppercase tracking-widest opacity-50">Insufficient Data.</p>
                ) : (
                  tips.map(tip => (
                    <div key={tip.id} className="border-l-2 border-[var(--text-ink)] pl-6 py-2">
                       <p className="text-sm font-medium font-mono-num">{tip.text}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Nudge Feed */}
        <div className="w-full md:w-3/5 flex flex-col bg-[var(--bg-paper)]">
          <div className="p-12 border-b border-[var(--border-thick)]">
             <h2 className="text-2xl font-bold uppercase tracking-wider">Gemini Intelligence Feed</h2>
          </div>

          <div className="flex-1 flex flex-col">
             {nudges.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">No AI nudges generated yet.</p>
                  <Link to="/log" className="btn-secondary text-xs">Upload Data for Analysis</Link>
                </div>
             ) : (
                <div className="divide-y divide-[var(--border-fine)]">
                   {nudges.map((nudge) => (
                      <div key={nudge.id} className={`p-12 transition-colors ${nudge.is_read ? 'opacity-50' : 'bg-[var(--bg-surface)]'}`}>
                         <div className="flex items-start justify-between">
                            <div className="max-w-2xl">
                               <div className="flex items-center gap-4 mb-4">
                                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] border border-[var(--text-ink)] px-2 py-1">
                                     {nudge.category}
                                  </span>
                                  {!nudge.is_read && <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                                  <span className="text-xs font-mono-num opacity-50">{new Date(nudge.created_at).toLocaleString()}</span>
                               </div>
                               <p className="text-lg font-medium leading-relaxed">{nudge.content}</p>
                            </div>
                            {!nudge.is_read && (
                               <button onClick={() => handleMarkRead(nudge.id)} className="p-2 border border-transparent hover:border-[var(--text-ink)] transition-all">
                                  <CheckCircle className="w-6 h-6 text-[var(--text-ink)]" />
                               </button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
