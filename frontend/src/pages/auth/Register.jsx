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
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
  if (strength <= 1) return { color: "bg-error", text: "Weak", textColor: "text-error" };
  if (strength <= 3) return { color: "bg-warning", text: "Medium", textColor: "text-warning" };
  return { color: "bg-success", text: "Strong", textColor: "text-success" };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl"
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl mb-6 shadow-2xl shadow-teal-500/20"
          >
            <FiCode className="text-white text-3xl" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent mb-3"
          >
            LeetLab
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg"
          >
            Start your coding mastery journey
          </motion.p>
        </div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join thousands of developers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              leftIcon={<FiUser />}
              error={errors.name?.message}
              fullWidth
              {...register("name")}
            />

            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              leftIcon={<FiMail />}
              error={errors.email?.message}
              fullWidth
              {...register("email")}
            />

            {/* Password Field */}
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                leftIcon={<FiLock />}
                error={errors.password?.message}
                fullWidth
                {...register("password")}
              />

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Password Strength:</span>
                    <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
                      {strengthInfo.text}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      className={`h-full ${strengthInfo.color} transition-all duration-300`}
                    />
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      <p className="font-semibold mb-1">Suggestions:</p>
                      <ul className="space-y-1">
                        {passwordStrength.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-warning">•</span> {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={<FiLock />}
              error={errors.confirmPassword?.message}
              fullWidth
              {...register("confirmPassword")}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              size="lg"
              leftIcon={!isLoading && <FiCheck />}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
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
          className="text-center text-slate-400 text-sm mt-8"
        >
          By signing up, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
