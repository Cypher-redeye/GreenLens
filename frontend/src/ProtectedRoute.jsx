import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen bg-[var(--bg-paper)] flex flex-col items-center justify-center">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-ink)] animate-pulse">Authenticating...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
