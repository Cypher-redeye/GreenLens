import React, { useState, useEffect } from "react";
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
      <div className="pt-32 text-center text-emerald-glow">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-forest px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-8 flex items-center gap-3">
          <Trophy className="w-10 h-10" /> Campus Eco Warriors
        </h1>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => (
            <div
              key={idx}
              className={`card flex items-center justify-between p-4 ${
                idx < 3 ? "glow-border" : ""
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl font-bold glow-text w-12 text-center">
                  {entry.rank}
                </div>
                <div>
                  <div className="font-bold text-lg">{entry.username}</div>
                  <div className="text-xs text-gray-400">
                    Streak: {entry.streak} days
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold glow-text flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> {entry.xp_points}
                </div>
                <div className="text-xs text-gray-400">
                  {entry.weekly_co2_reduction.toFixed(1)} kg CO₂
                </div>
              </div>
              {entry.badge && (
                <div className="text-2xl ml-4">{entry.badge}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
