import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiUserPlus, FiArrowRight } from "react-icons/fi";
import useAuthStore from "../../stores/authStore";
import { useToastContext } from "../../contexts/ToastContext";

// Password strength calculator
const calculatePasswordStrength = (password) => {
  let strength = 0;
  const suggestions = [];

  if (password.length >= 8) strength += 1;
  else suggestions.push("At least 8 characters");

  if (password.length >= 12) strength += 1;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  else suggestions.push("Mix of uppercase and lowercase");

  if (/\d/.test(password)) strength += 1;
  else suggestions.push("Include numbers");

  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  else suggestions.push("Include special characters (!@#$%^&*)");

  return { strength, suggestions };
};

const getStrengthColor = (strength) => {
  if (strength <= 1) return { color: "bg-red-500", text: "Weak", textColor: "text-red-400" };
  if (strength <= 3)
    return { color: "bg-yellow-500", text: "Medium", textColor: "text-yellow-400" };
  return { color: "bg-green-500", text: "Strong", textColor: "text-green-400" };
};

// Validation schema
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, suggestions: [] });
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const { showSuccess, showError } = useToastContext();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ strength: 0, suggestions: [] });
    }
  }, [password]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      showSuccess("Registration Successful!", "Welcome to LeetLab!");
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      showError("Registration Failed", errorMessage);
    }
  };

  const strengthInfo = getStrengthColor(passwordStrength.strength);

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
              <FiUserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400 text-sm">Join thousands of developers</p>
          </div>

          {/* Register Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <div className="relative">
                <label
                  htmlFor="name"
                  className={`block text-sm mb-2 transition-colors ${
                    focusedField === "name" ? "text-purple-400" : "text-slate-400"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <FiUser
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "name" ? "text-purple-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white text-sm outline-none transition-all ${
                      focusedField === "name"
                        ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                        : errors.name
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    {...register("name")}
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-300 ${
                      focusedField === "name" ? "w-full" : "w-0"
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Password Strength:</span>
                      <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.suggestions.length > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        <p className="font-semibold mb-1">Suggestions:</p>
                        <ul className="space-y-1">
                          {passwordStrength.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="text-yellow-400">•</span> {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm mb-2 transition-colors ${
                    focusedField === "confirmPassword" ? "text-purple-400" : "text-slate-400"
                  }`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "confirmPassword" ? "text-purple-400" : "text-slate-400"
                    }`}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-700/50 border rounded-lg text-white text-sm outline-none transition-all ${
                      focusedField === "confirmPassword"
                        ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                        : errors.confirmPassword
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-300 ${
                      focusedField === "confirmPassword" ? "w-full" : "w-0"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
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
                    Create Account
                    <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
