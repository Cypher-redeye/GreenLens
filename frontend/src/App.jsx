import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/DashboardPage";
import { LogPage } from "./pages/LogPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { CoachPage } from "./pages/CoachPage";
import { ImpactPage } from "./pages/ImpactPage";
import "./index.css";

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <LogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <CoachPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <ImpactPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
