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
    <div className="pt-24 min-h-screen bg-forest-dark px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-2 flex items-center gap-3">
          <Trophy className="w-10 h-10" /> Campus Eco Warriors
        </h1>
        <p className="text-gray-400 mb-8">Ranked by XP earned from reducing your carbon footprint</p>

        {leaderboard.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold mb-2">No entries yet!</p>
            <p className="text-sm">
              Be the first on the leaderboard.{" "}
              <a href="/log" className="text-emerald-glow underline">
                Log an activity
              </a>{" "}
              to earn XP.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`card flex items-center justify-between p-4 ${
                  entry.rank <= 3 ? "glow-border" : ""
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl font-bold glow-text w-12 text-center">
                    {entry.rank}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{entry.username}</div>
                    <div className="text-xs text-gray-400">
                      🔥 Streak: {entry.streak ?? 0} days
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold glow-text flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> {entry.xp_points}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(entry.weekly_co2_reduction ?? 0).toFixed(1)} kg CO₂
                  </div>
                </div>
                {entry.badge && (
                  <div className="text-2xl ml-4">{entry.badge.split(" ")[0]}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
