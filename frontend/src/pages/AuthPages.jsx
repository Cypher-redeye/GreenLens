import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Mail, Lock, User, Building } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center pt-20">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold glow-text mb-6 text-center">
            Welcome Back
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Email</label>
              <div className="flex items-center gap-2 bg-forest/50 border border-emerald-glow/30 rounded-lg px-4 py-2">
                <Mail className="w-5 h-5 text-emerald-glow" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Password
              </label>
              <div className="flex items-center gap-2 bg-forest/50 border border-emerald-glow/30 rounded-lg px-4 py-2">
                <Lock className="w-5 h-5 text-emerald-glow" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            No account?{" "}
            <a
              href="/register"
              className="text-emerald-glow hover:text-emerald-bright"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    campus: "Parul University",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center pt-20">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold glow-text mb-6 text-center">
            Join GreenLens
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              icon={User}
              label="Full Name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
            <FormField
              icon={User}
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <FormField
              icon={Mail}
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormField
              icon={Lock}
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm mb-2 text-gray-300">Campus</label>
              <select
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="w-full bg-forest/50 border border-emerald-glow/30 rounded-lg px-4 py-2 text-white"
              >
                <option>Parul University</option>
                <option>Other Campus</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have account?{" "}
            <a
              href="/login"
              className="text-emerald-glow hover:text-emerald-bright"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="block text-sm mb-2 text-gray-300">{label}</label>
    <div className="flex items-center gap-2 bg-forest/50 border border-emerald-glow/30 rounded-lg px-4 py-2">
      <Icon className="w-5 h-5 text-emerald-glow" />
      <input
        className="bg-transparent outline-none w-full"
        {...props}
        required
      />
    </div>
  </div>
);
