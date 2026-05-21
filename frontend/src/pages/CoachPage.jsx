import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { statsAPI, nudgesAPI } from "../api";
import { MessageCircle, CheckCircle, Leaf, Zap, TrendingDown } from "lucide-react";

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
      <div className="pt-32 text-center text-emerald-glow animate-pulse">
        Loading AI Coach...
      </div>
    );
  }

  // Generate personalised tips from real stats — only show relevant ones
  const generateTips = () => {
    if (!stats) return [];
    const tips = [];
    if (stats.xp_points === 0) {
      tips.push({
        icon: "📍",
        text: "Welcome! Log your first activity to start earning XP and getting AI coaching.",
      });
    }
    if (stats.xp_points > 0 && stats.xp_points < 50) {
      tips.push({
        icon: "🚀",
        text: `You have ${stats.xp_points} XP — you're just warming up! Log 5 activities to unlock your first badge.`,
      });
    }
    if (stats.weekly_co2_kg > 50) {
      tips.push({
        icon: "🚴",
        text: `Your weekly CO₂ is ${stats.weekly_co2_kg.toFixed(1)} kg — try carpooling or biking to cut transport emissions by up to 50%!`,
      });
    }
    if (stats.weekly_co2_kg > 0 && stats.weekly_co2_kg <= 20) {
      tips.push({
        icon: "🌟",
        text: `Impressive! Only ${stats.weekly_co2_kg.toFixed(1)} kg CO₂ this week. You're in the top eco performers!`,
      });
    }
    if (stats.streak_days >= 7) {
      tips.push({
        icon: "🔥",
        text: `${stats.streak_days}-day streak! Consistency is the key to real impact. Keep going!`,
      });
    }
    if (stats.streak_days === 0) {
      tips.push({
        icon: "⚡",
        text: "Log an activity today to start your daily streak. Streaks earn bonus XP!",
      });
    }
    if (stats.trees_saved_equivalent > 0) {
      tips.push({
        icon: "🌲",
        text: `You've saved the equivalent of ${stats.trees_saved_equivalent} tree${stats.trees_saved_equivalent !== 1 ? "s" : ""}. Share this with your friends!`,
      });
    }
    return tips;
  };

  const tips = generateTips();

  return (
    <div className="pt-24 min-h-screen bg-deep px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-xl text-neon-green mb-2">🤖 Your AI Coach</h1>
        <p className="text-white/40 mb-8 max-w-2xl">
          Personalised tips based on your actual carbon data
        </p>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center py-4">
              <Zap className="w-6 h-6 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-green">{stats.xp_points}</div>
              <div className="text-xs text-white/30">XP Points</div>
            </div>
            <div className="card text-center py-4">
              <TrendingDown className="w-6 h-6 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-green">{stats.weekly_co2_kg?.toFixed(1)} kg</div>
              <div className="text-xs text-white/30">Weekly CO₂</div>
            </div>
            <div className="card text-center py-4">
              <Leaf className="w-6 h-6 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-green">{stats.trees_saved_equivalent}</div>
              <div className="text-xs text-white/30">Trees Saved</div>
            </div>
          </div>
        )}

        {/* Personalised Tips */}
        <div className="card glass-mid mb-8">
          <h2 className="heading-lg text-neon-green mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" /> Personalised Tips
          </h2>
          {tips.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Keep logging activities — your personalised tips will appear here!
            </p>
          ) : (
            <div className="space-y-4">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-bright/10 border-l-4 border-emerald-bright p-4 rounded"
                >
                  <p className="text-white">
                    <span className="mr-2 text-lg">{tip.icon}</span>
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Nudges History */}
        <div className="card glass-mid">
          <h2 className="heading-lg text-neon-green mb-6">Gemini AI Nudges</h2>
          {nudges.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>No nudges yet.</p>
              <p className="mt-2">
                <Link to="/log" className="text-emerald-glow underline">
                  Log an activity
                </Link>{" "}
                and Gemini will generate a personalised coaching message for you!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {nudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className={`border p-4 rounded-lg transition-all ${
                    nudge.is_read
                      ? "border-emerald-glow/10 opacity-60"
                      : "border-emerald-glow/30 bg-forest/50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="capitalize text-sm text-emerald-glow font-bold mb-2 flex items-center gap-2">
                        <span>{nudge.category}</span>
                        {!nudge.is_read && (
                          <span className="px-2 py-0.5 bg-emerald-glow/20 text-emerald-glow text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200">{nudge.content}</p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(nudge.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!nudge.is_read && (
                      <button
                        onClick={() => handleMarkRead(nudge.id)}
                        className="ml-4 p-1 text-gray-400 hover:text-emerald-glow transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
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
  );
};
