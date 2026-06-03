import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/log",       label: "Log" },
  { to: "/coach",     label: "Coach" },
  { to: "/leaderboard", label: "Ranks" },
  { to: "/impact",    label: "Impact" },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  
  const navItems = user?.role === "admin" 
    ? [...NAV_ITEMS, { to: "/admin", label: "Admin" }]
    : NAV_ITEMS;
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-paper)] border-b border-[var(--border-thick)] h-20 flex justify-center">
      <nav className="w-full px-8 md:px-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-black tracking-tight uppercase font-display">
          GreenLens<span className="text-[var(--accent)]">.</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                    active
                      ? "text-[var(--text-ink)] border-b-2 border-[var(--text-ink)] pb-1"
                      : "text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-6">
            <select
              value={region}
              onChange={handleRegionChange}
              className="text-xs uppercase tracking-widest font-bold px-4 py-2 border border-[var(--border-fine)] bg-transparent cursor-pointer focus:outline-none focus:border-[var(--text-ink)] transition-colors"
            >
              <option value="IN">IN Grid</option>
              <option value="US">US Grid</option>
            </select>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[#FF5D5D] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-8">
             <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-ink)]">
              Sign In
            </Link>
             <Link to="/register" className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] border-b-2 border-[var(--accent)] hover:border-[var(--text-ink)] transition-colors pb-1">
              Start Free
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};
