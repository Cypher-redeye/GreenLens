import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leaderboardAPI } from "../api";
import { Trophy, TrendingUp } from "lucide-react";

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await leaderboardAPI.get(50);
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Loading Ranks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <div className="p-12 border-b border-[var(--border-thick)] bg-[var(--bg-surface)]">
          <p className="font-mono-num text-[var(--text-muted)] text-sm tracking-widest uppercase mb-4">
            GLOBAL.GRID // LEADERBOARD
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none mb-4">
            Eco Warriors.
          </h1>
          <p className="text-[var(--text-muted)] text-xl font-medium max-w-2xl">
            Ranked by XP earned from reducing their carbon footprint.
          </p>
        </div>

        {/* Leaderboard Grid */}
        <div className="bg-[var(--bg-paper)]">
          {leaderboard.length === 0 ? (
            <div className="p-24 text-center">
              <p className="text-lg font-bold mb-2 text-[var(--text-ink)]">No entries yet.</p>
              <Link to="/log" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--text-ink)] hover:text-[var(--text-ink)] transition-colors">
                Log an activity to be the first.
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-8 border-b border-[var(--border-thick)] bg-[var(--text-ink)] text-[var(--bg-paper)] text-xs font-bold uppercase tracking-widest">
                <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                <div className="col-span-5 md:col-span-4">User</div>
                <div className="col-span-3 text-right">XP</div>
                <div className="col-span-2 md:col-span-4 text-right hidden md:block">Reduction (kg CO₂)</div>
              </div>

              {/* Rows */}
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-12 gap-4 p-8 border-b border-[var(--border-fine)] items-center transition-colors hover:bg-[var(--bg-surface)] ${
                    entry.rank === 1 ? "bg-[var(--accent)] hover:bg-[var(--accent)]" : ""
                  }`}
                >
                  <div className="col-span-2 md:col-span-1 text-center">
                    <span className="font-mono-num text-3xl font-bold">{entry.rank}</span>
                  </div>
                  <div className="col-span-5 md:col-span-4 flex flex-col">
                    <span className="font-bold text-xl">{entry.username}</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2 mt-1">
                      Streak: {entry.streak ?? 0} {entry.badge && `— ${entry.badge.split(" ")[0]}`}
                    </span>
                  </div>
                  <div className="col-span-5 md:col-span-3 text-right">
                    <span className="font-mono-num text-2xl font-bold">{entry.xp_points}</span>
                  </div>
                  <div className="col-span-4 text-right hidden md:block">
                    <span className="font-mono-num text-lg opacity-80">{(entry.weekly_co2_reduction ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
