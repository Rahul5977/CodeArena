import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToastContext } from "../../contexts/ToastContext";
import { FiEye, FiEyeOff, FiUser, FiLock, FiCode, FiMail, FiCheck, FiX } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) strength++;
    });

    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch =
    formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError("Password Mismatch", "Passwords do not match");
      return;
    }

    if (passwordStrength.strength < 3) {
      showError("Weak Password", "Please use a stronger password");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      showSuccess("Success", "Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      showError("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength <= 1) return "Very Weak";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl mb-6 shadow-2xl">
            <FiCode className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            LeetLab
          </h1>
          <p className="text-gray-400 text-lg">Join the coding revolution</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-gray-400">Start your journey to coding excellence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiUser className="text-indigo-400" />
                  Full Name
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-indigo-400 focus:bg-white/15 transition-all duration-300 pl-12 rounded-xl"
                  placeholder="Enter your full name"
                  required
                />
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiMail className="text-cyan-400" />
                  Email Address
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:bg-white/15 transition-all duration-300 pl-12 rounded-xl"
                  placeholder="Enter your email"
                  required
                />
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiLock className="text-purple-400" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-white/15 transition-all duration-300 pl-12 pr-12 rounded-xl"
                  placeholder="Create a strong password"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(
                          passwordStrength.strength
                        )}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength >= 3 ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {getStrengthText(passwordStrength.strength)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.checks.length ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {passwordStrength.checks.length ? <FiCheck size={12} /> : <FiX size={12} />}
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.checks.uppercase ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {passwordStrength.checks.uppercase ? (
                        <FiCheck size={12} />
                      ) : (
                        <FiX size={12} />
                      )}
                      Uppercase
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.checks.lowercase ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {passwordStrength.checks.lowercase ? (
                        <FiCheck size={12} />
                      ) : (
                        <FiX size={12} />
                      )}
                      Lowercase
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        passwordStrength.checks.number ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {passwordStrength.checks.number ? <FiCheck size={12} /> : <FiX size={12} />}
                      Number
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiLock className="text-pink-400" />
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/15 transition-all duration-300 pl-12 pr-12 rounded-xl ${
                    formData.confirmPassword &&
                    (passwordsMatch
                      ? "focus:border-green-400 border-green-400/50"
                      : "focus:border-red-400 border-red-400/50")
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <FiCheck className="text-green-400" />
                    ) : (
                      <FiX className="text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || !passwordsMatch || passwordStrength.strength < 3}
              className="btn w-full bg-gradient-to-r from-indigo-600 to-cyan-600 border-none hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 h-14 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiUser />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-gray-500 my-8">Already have an account?</div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="btn btn-outline w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-xl h-14 font-semibold"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400 text-sm mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <FiCode className="text-green-400" />
              </div>
              <span>Practice Daily</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-400" />
              </div>
              <span>Compete with Others</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <FiLock className="text-purple-400" />
              </div>
              <span>Track Progress</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Free to start • No credit card required</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
