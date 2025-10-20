import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiEye, FiEyeOff, FiMail, FiLock, FiLogIn, FiArrowRight } from "react-icons/fi";
import useAuthStore from "../../stores/authStore";
import { useToastContext } from "../../contexts/ToastContext";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { showSuccess, showError } = useToastContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      showSuccess("Welcome back!", "You have successfully logged in.");

      // Redirect to the page they were trying to access or dashboard
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      showError("Login Failed", errorMessage);
    }
  };

  // Generate floating particles
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 4}s`,
    });
  }

  return (
    <>
      <style>{`
        @keyframes slideInFromBottom {
          from { opacity: 0; transform: translateY(2rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .floating-particle { animation: float 3s ease-in-out infinite; }
        .pulse-bg { animation: pulse 3s ease-in-out infinite; }
        .pulse-bg-delay-1 { animation: pulse 3s ease-in-out infinite; animation-delay: 1s; }
        .pulse-bg-delay-2 { animation: pulse 3s ease-in-out infinite; animation-delay: 0.5s; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="pulse-bg absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="pulse-bg-delay-1 absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="pulse-bg-delay-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="floating-particle absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>

        {/* Main Card */}
        <div className="relative w-full max-w-md z-10 animate-[slideInFromBottom_1s_ease-out]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-pink-500 rounded-xl mb-4 transition-transform hover:scale-110">
              <FiLogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`block text-sm mb-2 transition-colors ${
                    focusedField === "email" ? "text-purple-400" : "text-slate-400"
                  }`}
                >
                  Email
                </label>
                <div className="relative">
                  <FiMail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "email" ? "text-purple-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white text-sm outline-none transition-all ${
                      focusedField === "email"
                        ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                        : errors.email
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    {...register("email")}
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-300 ${
                      focusedField === "email" ? "w-full" : "w-0"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className={`block text-sm mb-2 transition-colors ${
                    focusedField === "password" ? "text-purple-400" : "text-slate-400"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <FiLock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "password" ? "text-purple-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-700/50 border rounded-lg text-white text-sm outline-none transition-all ${
                      focusedField === "password"
                        ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                        : errors.password
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-300 ${
                      focusedField === "password" ? "w-full" : "w-0"
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
