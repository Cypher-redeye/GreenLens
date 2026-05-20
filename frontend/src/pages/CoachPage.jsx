import React, { useState, useEffect } from "react";
import { statsAPI, nudgesAPI } from "../api";
import { MessageCircle } from "lucide-react";

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

  if (loading) {
    return (
      <div className="pt-32 text-center text-emerald-glow">
        Loading Coach...
      </div>
    );
  }

  const generateTips = () => {
    const tips = [];
    if (stats.xp_points < 100) {
      tips.push(
        "📍 You're just starting! Log your activities regularly to earn XP.",
      );
    }
    if (stats.weekly_co2_kg > 50) {
      tips.push(
        "🚴 Try carpooling or biking to reduce transport emissions by 50%!",
      );
    }
    if (stats.streak_days > 0 && stats.streak_days % 7 === 0) {
      tips.push(
        "🎉 Amazing! A " + stats.streak_days + " day streak! Keep it up!",
      );
    }
    return tips;
  };

  return (
    <div className="pt-24 min-h-screen bg-forest px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold glow-text mb-2">🤖 Your AI Coach</h1>
        <p className="text-gray-300 mb-8">
          Personalized tips to reduce your carbon footprint
        </p>

        {/* Daily Tips */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" /> Today's Tips
          </h2>
          <div className="space-y-4">
            {generateTips().map((tip, idx) => (
              <div
                key={idx}
                className="bg-emerald-bright/10 border-l-4 border-emerald-bright p-4 rounded"
              >
                <p className="text-white">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Nudges History */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Nudges</h2>
          <div className="space-y-4">
            {nudges.slice(0, 5).map((nudge) => (
              <div
                key={nudge.id}
                className="bg-forest/50 border border-emerald-glow/30 p-4 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="capitalize text-sm text-emerald-glow font-bold mb-2">
                      {nudge.category}
                    </div>
                    <p className="text-gray-200">{nudge.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(nudge.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!nudge.is_read && (
                    <div className="ml-4 px-3 py-1 bg-emerald-glow/20 text-emerald-glow text-xs rounded-full">
                      New
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
