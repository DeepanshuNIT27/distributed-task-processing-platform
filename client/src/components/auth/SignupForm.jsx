import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { validateSignup } from "../../utils/validators";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth"; // 🔥 FIX 1: Import kiya

export default function SignupForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 FIX 1: Hook nikala
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 🔥 FIX 2: Naya state add kiya
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submission

    const validationErrors = validateSignup(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // 🔥 FIX 1: Context wala login use kiya
      login({
        token: response.token,
        user: response.user,
      });

      toast.success(response.message || "Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-200">Create Account</h2>
        <p className="text-slate-400 mt-2">Join us to process your images</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300">
            Full Name
          </label>
          <div className="relative mt-1">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${errors.name ? "border-red-500" : "border-slate-700"} rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

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
              className={`w-full pl-10 pr-4 py-3 bg-slate-900 border ${errors.email ? "border-red-500" : "border-slate-700"} rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">Password</label>
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
              className={`w-full pl-10 pr-12 py-3 bg-slate-900 border ${errors.password ? "border-red-500" : "border-slate-700"} rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            {/* 🔥 FIX 2: State updated and Eye icon added */}
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-3 bg-slate-900 border ${errors.confirmPassword ? "border-red-500" : "border-slate-700"} rounded-xl text-slate-200 focus:outline-none focus:border-[#A855F7] transition-colors`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white py-3 rounded-xl font-medium transition-all mt-6 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <UserPlus size={20} />
          )}
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-400 text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[#A855F7] hover:text-[#7C3AED] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
