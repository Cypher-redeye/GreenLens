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

  const handleExport = async (format) => {
    try {
      const res = await organizationsAPI.exportData(user.org_id, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `greenlens_org_${user.org_id}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setError(`Failed to export ${format.toUpperCase()} report.`);
    }
  };

  // Protect route
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Loading Admin Panel...</div>
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
    <div className="min-h-screen bg-[var(--bg-paper)] pt-20 px-8 md:px-24">
      <div className="max-w-[100rem] mx-auto animate-fadeUp border-x border-[var(--border-fine)] min-h-[calc(100vh-80px)] flex flex-col">
        
        {/* Header Section */}
        <div className="p-12 border-b border-[var(--border-thick)] flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-[var(--bg-surface)]">
          <div>
            <p className="font-mono-num text-[var(--text-muted)] text-sm tracking-widest uppercase mb-4">
              ORG.ID // CORPORATE
            </p>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none">
              Admin.
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleExport('csv')}
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-100 text-red-800 border-b border-[var(--border-thick)] font-mono-num text-sm font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        {/* Swiss Grid KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[var(--border-thick)]">
          
          {/* Main KPI */}
          <div className="col-span-1 md:col-span-2 p-12 border-b md:border-b-0 md:border-r border-[var(--border-fine)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Total CO₂ Saved</span>
              <Leaf className="w-5 h-5 text-[var(--text-ink)]" />
            </div>
            <div>
              <div className="font-mono-num text-7xl md:text-9xl font-bold tracking-tighter leading-none mb-2">
                {stats?.total_co2_saved?.toFixed(1) || "0.0"}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Kilograms of CO₂</div>
            </div>
          </div>

          {/* Sub KPIs */}
          <div className="col-span-1 md:col-span-1 border-b md:border-b-0 md:border-r border-[var(--border-fine)] grid grid-rows-2">
            <div className="p-8 border-b border-[var(--border-fine)] flex flex-col justify-between bg-[var(--accent)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)]">Active Employees</span>
              <div className="font-mono-num text-5xl font-bold mt-4">{stats?.employee_count || 0}</div>
            </div>
            <div className="p-8 flex flex-col justify-between bg-[#FF4D00] text-[#F7F5F0]">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Equivalent Trees</span>
              <div className="font-mono-num text-5xl font-bold mt-4">{Math.floor((stats?.total_co2_saved || 0) / 21)}</div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 p-8 flex flex-col justify-center items-center bg-[var(--bg-surface)] text-center">
             <Building className="w-10 h-10 text-[var(--text-muted)] mb-4" />
             <div className="text-sm font-bold uppercase tracking-widest text-[var(--text-ink)]">Corporate Overview</div>
             {stats?.invite_code && (
               <div className="mt-6 p-4 border border-[var(--border-thick)] bg-[var(--bg-paper)] w-full">
                 <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Employee Invite Code</div>
                 <div className="font-mono-num text-2xl font-bold tracking-widest text-[var(--accent)]">{stats.invite_code}</div>
               </div>
             )}
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 border-b border-[var(--border-thick)] bg-[var(--bg-surface)] flex-1">
          <div className="p-12 flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-bold uppercase tracking-wide">Emissions Offset Over Time</h2>
              <span className="pill">Current</span>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={60}>
                  <CartesianGrid stroke="var(--border-fine)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--text-ink)" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--text-ink)', color: 'var(--bg-paper)', borderRadius: '0', border: '1px solid var(--border-thick)' }}
                    itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                    cursor={{ fill: "rgba(11,18,14,0.03)" }}
                  />
                  <Bar dataKey="co2" fill="var(--text-ink)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
