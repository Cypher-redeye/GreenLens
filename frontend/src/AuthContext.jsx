import React, { createContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("authToken");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem("authToken", res.data.access_token);
      setUser({ id: res.data.user_id, username: res.data.username });
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await authAPI.register(data);
      localStorage.setItem("authToken", res.data.access_token);
      setUser({ id: res.data.user_id, username: res.data.username });
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
