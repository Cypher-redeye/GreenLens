import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { organizationsAPI } from "../api";
import { Building, Users, Leaf, Download, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.org_id) {
          const res = await organizationsAPI.getStats(user.org_id);
          setStats(res.data);
        }
      } catch (err) {
        setError("Failed to load organization stats. Make sure you are an admin.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  // Protect route
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center pt-20">
        <div className="animate-spin text-emerald-glow">
          <Leaf className="w-8 h-8" />
        </div>
      </div>
    );
  }

  // Mock data for the chart to show B2B capability
  const chartData = [
    { name: "Week 1", co2: stats?.total_co2_saved * 0.1 || 0 },
    { name: "Week 2", co2: stats?.total_co2_saved * 0.3 || 0 },
    { name: "Week 3", co2: stats?.total_co2_saved * 0.2 || 0 },
    { name: "Week 4", co2: stats?.total_co2_saved * 0.4 || 0 },
  ];

  return (
    <div className="min-h-screen bg-forest pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Building className="text-emerald-glow" />
              Corporate Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your organization's sustainability metrics.
            </p>
          </div>
          <a
            href={organizationsAPI.getExportUrl(user.org_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2 px-6"
          >
            <Download className="w-5 h-5" />
            Export CSV Report
          </a>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card text-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-emerald-glow/10 group-hover:text-emerald-glow/20 transition-colors">
              <Leaf className="w-32 h-32" />
            </div>
            <h3 className="text-gray-400 mb-2 relative z-10">Total CO₂ Saved</h3>
            <div className="text-4xl font-bold text-white relative z-10">
              {stats?.total_co2_saved?.toFixed(1) || "0.0"} <span className="text-xl text-gray-500">kg</span>
            </div>
          </div>

          <div className="card text-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-emerald-glow/10 group-hover:text-emerald-glow/20 transition-colors">
              <Users className="w-32 h-32" />
            </div>
            <h3 className="text-gray-400 mb-2 relative z-10">Active Employees</h3>
            <div className="text-4xl font-bold text-white relative z-10">
              {stats?.employee_count || 0}
            </div>
          </div>
          
          <div className="card text-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-emerald-glow/10 group-hover:text-emerald-glow/20 transition-colors">
              <TrendingUp className="w-32 h-32" />
            </div>
            <h3 className="text-gray-400 mb-2 relative z-10">Equivalent Trees</h3>
            <div className="text-4xl font-bold text-white relative z-10">
              {Math.floor((stats?.total_co2_saved || 0) / 21)}
            </div>
          </div>
        </div>

        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-white mb-6">Emissions Offset Over Time</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5EFFA0" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 26, 18, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(105, 240, 174, 0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#5EFFA0', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(105, 240, 174, 0.05)' }}
                />
                <Bar dataKey="co2" fill="url(#colorCo2)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
