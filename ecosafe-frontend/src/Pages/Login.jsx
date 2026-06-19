import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, CheckCircle } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");

    if (isForgotPassword) {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, newPassword: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          return;
        }
        setResetSuccess("Password reset successfully. You can now log in.");
        setIsForgotPassword(false);
        setForm({ email: "", password: "", confirmPassword: "" });
      } catch (err) {
        setError("Server not reachable. Please check connection.");
      }
    } else {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        // Save token
        localStorage.setItem("token", data.token);

        // Go to dashboard
        navigate("/dashboard");
      } catch (err) {
        setError("Server not reachable. Please check connection.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 relative overflow-hidden px-4">
      {/* Decorative backdrop bubbles */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-green-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[70%] bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-500/10">
            🛡️
          </div>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-gray-800">
          {isForgotPassword ? "Reset Password" : "Welcome to EcoSafe"}
        </h2>
        <p className="text-xs text-gray-400 mt-1.5 mb-8">
          {isForgotPassword ? "Create a new strong password below" : "Protecting Communities through Technology"}
        </p>

        {/* SWITCH TABS */}
        {!isForgotPassword && (
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 gap-1">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-white text-green-700 shadow-sm transition cursor-pointer"
            >
              Login
            </button>

            <button 
              onClick={() => navigate("/Signup")}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* MESSAGES */}
        {error && (
          <div className="bg-red-50 border border-red-200/50 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 text-left">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {resetSuccess && (
          <div className="bg-green-50 border border-green-200/50 text-green-700 p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 text-left">
            <CheckCircle size={14} className="shrink-0" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleAuth} className="text-left space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              placeholder="e.g. name@domain.com"
              onChange={handleChange}
              className="w-full p-3 text-sm border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {isForgotPassword ? "New Password" : "Password"}
              </label>
              {!isForgotPassword && (
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(true); setError(""); setResetSuccess(""); }}
                  className="text-[11px] font-bold text-green-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={form.password}
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 text-sm pr-10 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-green-600 transition focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isForgotPassword && (
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={form.confirmPassword}
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full p-3 text-sm pr-10 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full py-3 rounded-xl font-bold text-sm shadow-md shadow-green-600/10 hover:shadow-lg hover:shadow-green-600/15 transition cursor-pointer mt-6"
          >
            {isForgotPassword ? "Reset Password" : "Access Dashboard"}
          </button>
        </form>

        <div className="mt-6">
          {isForgotPassword ? (
            <p className="text-xs text-gray-500">
              Remember your password?{" "}
              <span
                onClick={() => { setIsForgotPassword(false); setError(""); }}
                className="text-green-600 cursor-pointer font-bold hover:underline"
              >
                Back to Login
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/Signup")}
                className="text-green-600 cursor-pointer font-bold hover:underline"
              >
                Create Account
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;