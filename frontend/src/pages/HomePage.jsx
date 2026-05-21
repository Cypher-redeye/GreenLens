import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { campusAPI } from "../api";
import { ArrowRight, Zap, Leaf, Users } from "lucide-react";

/* Animated number counter */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const FEATURES = [
  { icon: "📸", label: "AI Receipt Scanner" },
  { icon: "🌍", label: "Global Carbon Grids" },
  { icon: "🤖", label: "Gemini AI Coach" },
  { icon: "🏆", label: "Campus Leaderboard" },
  { icon: "⚡", label: "Instant CO₂ Calc" },
  { icon: "🌲", label: "Tree Equivalents" },
  { icon: "📊", label: "Live Impact Charts" },
  { icon: "🔥", label: "Daily Streaks" },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campusStats, setCampusStats] = useState(null);

  useEffect(() => {
    campusAPI.getStats()
      .then((r) => setCampusStats(r.data))
      .catch(() => {});
  }, []);

  const studentCount = useCounter(campusStats?.students_tracking ?? 0);
  const co2Count = useCounter(campusStats ? Math.floor(campusStats.total_co2_kg) : 0);
  const treeCount = useCounter(campusStats?.trees_equivalent ?? 0);

  return (
    <div className="min-h-screen bg-deep overflow-hidden relative">

      {/* Background glows */}
      <div className="glow-blob glow-blob-green w-[600px] h-[600px] -top-40 -left-40" />
      <div className="glow-blob glow-blob-gold w-[400px] h-[400px] top-1/2 -right-20" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

          {/* Left: Copy */}
          <div className="stagger">
            <h1 className="heading-xl text-white mb-6 animate-fadeUp">
              Track your{" "}
              <span className="relative inline-block">
                <span className="text-neon-green">carbon</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, #5EFFA0, transparent)",
                  }}
                />
              </span>
              .{" "}
              <br />
              Change your{" "}
              <span className="text-white/40">campus.</span>
            </h1>

            <p className="text-white/50 text-lg mb-10 max-w-md leading-relaxed animate-fadeUp">
              AI-powered sustainability platform for Indian college students.
              Log in 60 seconds, get smarter every day.
            </p>

            <div className="flex flex-wrap gap-3 animate-fadeUp">
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/log")}
                    className="btn-primary"
                  >
                    <Zap className="w-4 h-4" />
                    Start Tracking
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-secondary"
                  >
                    View Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/register")}
                    className="btn-primary"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-secondary"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Live stats card */}
          <div className="animate-fadeUp relative">
            <div className="glass-mid rounded-3xl p-8 relative overflow-hidden">
              {/* Decorative ring */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full border animate-spin-slow"
                style={{ borderColor: "rgba(105, 240, 174, 0.06)" }}
              />
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full border"
                style={{ borderColor: "rgba(105, 240, 174, 0.1)" }}
              />

              <div className="text-xs font-medium text-white/30 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Live Campus Data · Parul University
              </div>

              <div className="space-y-6">
                <StatRow
                  icon={<Users className="w-5 h-5" />}
                  value={studentCount.toLocaleString()}
                  label="Students Tracking"
                  color="text-neon-green"
                />
                <div className="divider" />
                <StatRow
                  icon={<Zap className="w-5 h-5 text-gold" />}
                  value={`${co2Count.toLocaleString()} kg`}
                  label="CO₂ Footprint Tracked"
                  color="text-gold"
                />
                <div className="divider" />
                <StatRow
                  icon={<Leaf className="w-5 h-5 text-green-400" />}
                  value={treeCount.toLocaleString()}
                  label="Tree Equivalents Saved"
                  color="text-green-400"
                />
              </div>

              {/* Bottom CTA */}
              {!user && (
                <button
                  onClick={() => navigate("/register")}
                  className="w-full mt-8 btn-primary justify-center"
                >
                  Join the Movement
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrolling Feature Marquee ─────────────────────── */}
      <div
        className="relative z-10 border-y overflow-hidden py-4"
        style={{ borderColor: "rgba(105, 240, 174, 0.07)" }}
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {[...FEATURES, ...FEATURES].map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 mx-8 text-sm text-white/30 font-medium"
            >
              <span>{f.icon}</span>
              {f.label}
              <span className="text-white/10 ml-6">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ icon, value, label, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className={color}>{icon}</span>
      </div>
      <span className="text-sm text-white/50">{label}</span>
    </div>
    <span className={`font-mono-num font-semibold text-xl ${color}`}>{value}</span>
  </div>
);
