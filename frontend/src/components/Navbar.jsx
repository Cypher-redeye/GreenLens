import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";
import { useAuth } from "../AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [region, setRegion] = React.useState(localStorage.getItem("globalRegion") || "IN");

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    setRegion(newRegion);
    localStorage.setItem("globalRegion", newRegion);
    // Reload page to apply changes everywhere simply
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 w-full glassmorphism z-50 border-b-0">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-emerald-glow" />
          <span className="text-xl font-bold glow-text">GreenLens</span>
        </Link>
        {user && (
          <div className="flex gap-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/log">Log</NavLink>
            <NavLink to="/coach">Coach</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/impact">Impact</NavLink>
            
            <select 
              value={region} 
              onChange={handleRegionChange}
              className="bg-forest border border-emerald-glow/50 text-emerald-glow rounded-md px-2 py-1 text-sm mx-2 focus:outline-none"
            >
              <option value="IN">IN (CEA Grid)</option>
              <option value="US">US (EPA Grid)</option>
            </select>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="px-4 py-2 text-sm hover:text-emerald-glow transition-colors"
  >
    {children}
  </Link>
);
