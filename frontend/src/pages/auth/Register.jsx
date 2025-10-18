import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiCode,
  FiUser,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl"
          >
            <FiCode className="text-white text-3xl" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3"
          >
            LeetLab
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg"
          >
            Start your coding mastery journey
          </motion.p>
        </div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Join thousands of developers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <FiUser className="text-green-400" />
                Full Name
              </label>
              <div className="relative">
                <input
                  {...register("name")}
                  type="text"
                  className={`w-full px-4 py-3 pl-12 bg-white/10 border ${
                    errors.name ? "border-red-500" : "border-white/20"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all`}
                  placeholder="Enter your full name"
                />
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm flex items-center gap-1"
                >
                  <FiAlertCircle /> {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <FiMail className="text-blue-400" />
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full px-4 py-3 pl-12 bg-white/10 border ${
                    errors.email ? "border-red-500" : "border-white/20"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all`}
                  placeholder="Enter your email"
                />
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm flex items-center gap-1"
                >
                  <FiAlertCircle /> {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <FiLock className="text-purple-400" />
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => {
                    register("password").onChange(e);
                    setPasswordStrength(calculatePasswordStrength(e.target.value));
                  }}
                  className={`w-full px-4 py-3 pl-12 pr-12 bg-white/10 border ${
                    errors.password ? "border-red-500" : "border-white/20"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all`}
                  placeholder="Create a strong password"
                />
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm flex items-center gap-1"
                >
                  <FiAlertCircle /> {errors.password.message}
                </motion.p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Password Strength:</span>
                    <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      className={`h-full ${strengthInfo.color} transition-all duration-300`}
                    />
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
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
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <FiLock className="text-purple-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pl-12 pr-12 bg-white/10 border ${
                    errors.confirmPassword ? "border-red-500" : "border-white/20"
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all`}
                  placeholder="Confirm your password"
                />
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm flex items-center gap-1"
                >
                  <FiAlertCircle /> {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating account...
                </>
              ) : (
                <>
                  <FiCheck />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-400 text-sm mt-8"
        >
          By signing up, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
