import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiEye, FiEyeOff, FiMail, FiLock, FiCode, FiAlertCircle } from "react-icons/fi";
import useAuthStore from "../../stores/authStore";
import { useToastContext } from "../../contexts/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo and Header */}
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
            Welcome back to your coding journey
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 hover:bg-slate-800/60 transition-all duration-300"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Log In</h2>
            <p className="text-slate-400">Continue your coding excellence</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<FiLock />}
              error={errors.password?.message}
              fullWidth
              {...register("password")}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" fullWidth loading={isLoading} size="lg">
              Log In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-700/50" />
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                Sign up now
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
          © 2024 LeetLab. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
