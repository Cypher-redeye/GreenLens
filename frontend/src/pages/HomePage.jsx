import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { campusAPI } from "../api";
import { ArrowRight } from "lucide-react";

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
  "AI Receipt Scanner",
  "Global Carbon Grids",
  "Gemini AI Coach",
  "Corporate Leaderboards",
  "Instant CO₂ Calc",
  "Tree Equivalents",
  "Live Impact Charts",
  "Daily Streaks",
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-paper)] text-[var(--text-ink)]">
      
      {/* Decorative Editorial Lines */}
      <div className="absolute top-0 bottom-0 left-8 md:left-24 w-[1px] bg-[var(--border-fine)] pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-8 md:right-24 w-[1px] bg-[var(--border-fine)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[100rem] mx-auto px-8 md:px-24 pt-48 pb-12 min-h-screen flex flex-col justify-between">
        
        {/* Top: Massive Typography */}
        <div className="max-w-6xl stagger animate-clipReveal mt-4">
          <p className="font-mono-num text-[var(--text-muted)] text-sm tracking-widest uppercase mb-8 ml-1">
            01 — The New Standard
          </p>
          <h1 className="heading-xl mb-12 italic pr-4">
            Measure Impact.
            <br />
            <span className="not-italic text-[var(--text-muted)]">Design the Future.</span>
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 items-start mt-16">
            <p className="text-[var(--text-ink)] text-xl font-light leading-relaxed max-w-lg">
              The intelligent sustainability platform for modern enterprises. Log your impact in seconds, guided by advanced AI, and track your global footprint in real time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start md:justify-end">
              {user ? (
                <>
                  <button onClick={() => navigate("/log")} className="btn-primary">
                    Start Tracking <ArrowRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="btn-secondary">
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/register")} className="btn-primary">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate("/login")} className="btn-secondary">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Minimalist Stats & Features */}
        <div className="mt-32 animate-fadeUp flex flex-col gap-12" style={{ animationDelay: '0.6s' }}>
          
          {/* Live Data Swiss Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-[var(--border-thick)]">
            <div className="p-8 border-b md:border-b-0 md:border-r border-[var(--border-fine)]">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Live Trackers</div>
              <div className="heading-lg flex items-baseline gap-3">
                {studentCount.toLocaleString()}
                <span className="text-sm font-bold text-[var(--text-ink)] uppercase tracking-widest font-sans">Active</span>
              </div>
            </div>
            <div className="p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Global CO₂ Reduced</div>
              <div className="heading-lg flex items-baseline gap-3">
                {co2Count.toLocaleString()}
                <span className="text-sm font-bold text-[var(--text-ink)] uppercase tracking-widest font-sans">KG</span>
              </div>
            </div>
          </div>

          {/* Marquee Features */}
          <div className="border-t border-[var(--border-thick)] border-b py-4 overflow-hidden relative -mx-8 md:-mx-24 px-8 md:px-24 bg-[var(--text-ink)] text-[var(--bg-paper)]">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--text-ink)] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--text-ink)] to-transparent z-10" />
            
            <div className="flex animate-marquee whitespace-nowrap items-center">
              {[...FEATURES, ...FEATURES, ...FEATURES].map((f, i) => (
                <span key={i} className="inline-flex items-center text-sm font-bold uppercase tracking-widest opacity-80 mx-12">
                  {f} <span className="w-2 h-2 rounded-full bg-[var(--accent)] ml-24" />
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
