import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { campusAPI } from "../api";
import { Leaf, Zap } from "lucide-react";

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campusStats, setCampusStats] = useState(null);
  const [co2Counter, setCo2Counter] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await campusAPI.getStats();
        setCampusStats(res.data);
        setCo2Counter(res.data.total_co2_kg);
      } catch (err) {
        console.error("Failed to fetch campus stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(() => {
      setCo2Counter((prev) => prev + Math.random() * 0.5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-forest overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-emerald-glow rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center py-20 animate-fadeInUp">
          <h1 className="text-6xl font-bold mb-4 glow-text">
            Track Your Carbon.
          </h1>
          <h2 className="text-5xl font-bold mb-6 text-white">
            Change Your Campus.
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered sustainability platform built for Indian college
            students. Log in 60 seconds. Get smarter every day.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            {user ? (
              <>
                <button
                  onClick={() => navigate("/log")}
                  className="btn-primary flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" /> Start Tracking
                </button>
                <button
                  onClick={() => navigate("/impact")}
                  className="btn-secondary"
                >
                  View Live Impact
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-secondary"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-16">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(105, 240, 174, 0.2)"
                strokeWidth="2"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#69F0AE"
                strokeWidth="8"
                strokeDasharray={`${(co2Counter % 100) * 5.65} 565`}
                className="animate-pulse-glow"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold glow-text">
                {co2Counter.toFixed(1)}
              </div>
              <div className="text-sm text-gray-300">kg CO₂ SAVED TODAY</div>
            </div>
          </div>
        </div>

        {campusStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <StatCard
              number={campusStats.students_tracking}
              label="STUDENTS TRACKING"
            />
            <StatCard
              number={campusStats.total_co2_kg.toFixed(0)}
              label="kg CO₂ SAVED"
              unit="TOTAL"
            />
            <StatCard
              number={campusStats.trees_equivalent}
              label="TREES EQUIVALENT"
            />
          </div>
        )}

        <div className="text-center py-8 border-t border-emerald-glow/20">
          <div className="text-emerald-glow text-sm uppercase tracking-widest">
            🌱 Parul University • Live Campus Data
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ number, label, unit }) => (
  <div className="card animate-fadeInUp">
    <div className="text-4xl font-bold glow-text mb-2">{number}</div>
    <div className="text-sm uppercase tracking-widest text-gray-400">
      {label}
    </div>
    {unit && <div className="text-xs text-gray-500">{unit}</div>}
  </div>
);
