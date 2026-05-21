import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LogOut, LayoutDashboard, PenLine, Trophy, Brain, Globe2 } from "lucide-react";
import { useAuth } from "../AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/log",       label: "Log",       icon: PenLine },
  { to: "/coach",     label: "Coach",     icon: Brain },
  { to: "/leaderboard", label: "Ranks",  icon: Trophy },
  { to: "/impact",    label: "Impact",    icon: Globe2 },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [region, setRegion] = React.useState(
    localStorage.getItem("globalRegion") || "IN"
  );

  const handleRegionChange = (e) => {
    const r = e.target.value;
    setRegion(r);
    localStorage.setItem("globalRegion", r);
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "rgba(3, 7, 10, 0.7)",
        backdropFilter: "blur(20px) saturate(1.6)",
        borderBottom: "1px solid rgba(105, 240, 174, 0.07)",
      }}
      className="fixed top-0 w-full z-50"
    >
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-emerald-glow/10 border border-emerald-glow/20 flex items-center justify-center group-hover:border-emerald-glow/50 transition-all">
            <Leaf className="w-4 h-4 text-neon-green" />
          </div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Green<span className="text-neon-green">Lens</span>
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-emerald-glow/10 text-neon-green border border-emerald-glow/20"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-2">
            {/* Region */}
            <select
              value={region}
              onChange={handleRegionChange}
              className="text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none"
              style={{
                borderColor: "rgba(105, 240, 174, 0.15)",
                color: "rgba(105, 240, 174, 0.6)",
              }}
            >
              <option value="IN" style={{ background: "#090F0C" }}>🇮🇳 IN Grid</option>
              <option value="US" style={{ background: "#090F0C" }}>🇺🇸 US Grid</option>
            </select>

            {/* User pill */}
            <div className="pill pill-green text-xs">
              {user.username}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-ghost text-xs !px-2 !py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
