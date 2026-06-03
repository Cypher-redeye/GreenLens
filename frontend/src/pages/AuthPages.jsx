import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { organizationsAPI } from "../api";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-paper)]">
      {/* Left: Editorial Splash */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-between border-r border-[var(--border-fine)] bg-[#EBE9E4] relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="text-xl font-black tracking-tight uppercase font-display">
            GreenLens<span className="text-[var(--accent)]">.</span>
          </Link>
        </div>
        
        <div className="relative z-10 max-w-lg mt-24 md:mt-0 stagger">
          <h1 className="heading-lg mb-6">Enter the New Standard.</h1>
          <p className="text-[var(--text-muted)] text-lg font-medium">
            Accountability meets elegant design. Access your corporate carbon ledger.
          </p>
        </div>
      </div>

      {/* Right: Brutalist Form */}
      <div className="w-full md:w-1/2 p-12 md:p-24 flex items-center justify-center">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="flex items-end justify-between mb-16 border-b border-[var(--text-ink)] pb-4">
            <h2 className="text-3xl font-display font-bold uppercase">Log In</h2>
            <Link to="/register" className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors">
              Create Account
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[var(--text-muted)]">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[var(--text-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex items-center justify-between group"
            >
              <span>{loading ? "Authenticating..." : "Access Ledger"}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </button>
          </form>
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
    invite_code: "",
    new_organization: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    setLoading(true);
    try {
      let orgId = null;
      let campusName = "General";
      
      if (formData.role === "employee") {
        if (!formData.invite_code) throw new Error("Invite code is required.");
        try {
          const orgRes = await organizationsAPI.getByInviteCode(formData.invite_code);
          orgId = orgRes.data.id;
          campusName = orgRes.data.name;
        } catch (orgErr) {
          throw new Error("Invalid invite code. Please check and try again.");
        }
      } else if (formData.role === "admin") {
        if (!formData.new_organization) throw new Error("Company name is required.");
        try {
          const orgRes = await organizationsAPI.create(formData.new_organization);
          orgId = orgRes.data.id;
          campusName = orgRes.data.name;
        } catch (orgErr) {
          throw new Error(orgErr.response?.data?.detail || "Organization creation failed. Please try a different name.");
        }
      }

      const payload = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        campus: campusName,
        org_id: orgId,
        role: formData.role
      };

      await register(payload);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-paper)]">
      {/* Left: Brutalist Form */}
      <div className="w-full md:w-1/2 p-12 md:p-24 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md animate-fadeUp">
          <div className="flex items-end justify-between mb-12 border-b border-[var(--text-ink)] pb-4">
            <h2 className="text-3xl font-display font-bold uppercase">Register</h2>
            <Link to="/login" className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors">
              Log In
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <FormField label="Full Name" type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
            <FormField label="Username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" />
            <FormField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" />
            <FormField label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            
            <div className="pt-4 border-t border-[var(--border-fine)] space-y-4">
              <div className="flex flex-col mb-4">
                 <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Account Type</label>
                 <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[var(--bg-paper)] border border-[var(--border-fine)] text-[var(--text-ink)] text-sm rounded focus:ring-[var(--accent)] focus:border-[var(--accent)] block p-2.5">
                   <option value="employee">Employee (Join existing company)</option>
                   <option value="admin">Admin (Create new company)</option>
                 </select>
              </div>

              {formData.role === "employee" && (
                <FormField label="Join Company (Invite Code)" type="text" name="invite_code" value={formData.invite_code} onChange={handleChange} required={true} placeholder="e.g. X7K9P2" />
              )}
              {formData.role === "admin" && (
                <FormField label="Create New Company" type="text" name="new_organization" value={formData.new_organization} onChange={handleChange} required={true} placeholder="Acme Corp" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-8 flex items-center justify-between group"
            >
              <span>{loading ? "Creating..." : "Create Account"}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </button>
          </form>
        </div>
      </div>

      {/* Right: Editorial Splash */}
      <div className="hidden md:flex w-1/2 p-12 flex-col justify-between border-l border-[var(--border-fine)] bg-[#EBE9E4] relative overflow-hidden">
        <div className="relative z-10 text-right">
          <Link to="/" className="text-xl font-black tracking-tight uppercase font-display">
            GreenLens<span className="text-[var(--accent)]">.</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-lg mt-24 md:mt-0 stagger ml-auto text-right">
          <h1 className="heading-lg mb-6">Pioneering Impact.</h1>
          <p className="text-[var(--text-muted)] text-lg font-medium">
            Join the most exclusive sustainability platform built for the modern enterprise.
          </p>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-[var(--text-muted)]">{label}</label>
    <input className="glass-input text-lg py-2" {...props} />
  </div>
);
