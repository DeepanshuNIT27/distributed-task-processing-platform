import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { validateLogin } from "../../utils/validators";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const validationErrors = validateLogin(formData.email, formData.password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);

      const response = await authService.loginUser(formData);

      login({
        token: response.token,
        user: response.user,
      });

      toast.success(response.message || "Login successful!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      // 🔥 SURGICAL STRIKE: Custom error message for invalid credentials
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error("Invalid user email or password");
      } else {
        toast.error(error.response?.data?.message || "Failed to login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-200">Welcome Back</h2>

        <p className="text-slate-400 mt-2">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300">
            Email Address
          </label>

          <div className="relative mt-1">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${
                errors.email ? "border-red-500" : "border-slate-700"
              } rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="you@example.com"
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Password
            </label>

            <span
              className="text-xs text-slate-500 cursor-not-allowed"
              title="Coming soon"
            >
              Forgot Password?
            </span>
          </div>

          <div className="relative mt-1">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-3 bg-slate-900 border ${
                errors.password ? "border-red-500" : "border-slate-700"
              } rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white py-3 rounded-xl font-medium transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-400 text-sm">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-[#A855F7] hover:text-[#7C3AED] font-medium"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
