import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiAlertCircle,
  FiShield,
  FiCalendar,
  FiCheck,
} from "react-icons/fi";
import useAuthStore from "../stores/authStore";
import { useToastContext } from "../contexts/ToastContext";
import Navbar from "../components/Navbar";
import apiClient from "../lib/apiClient";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Profile = () => {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToastContext();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      showSuccess("Password Changed", "Your password has been updated successfully.");
      reset();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      showError("Error", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "ADMIN":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
                  <p className="text-gray-400 mb-4">{user?.email}</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadgeColor(
                      user?.role
                    )}`}
                  >
                    <FiShield className="text-sm" />
                    {user?.role}
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiCalendar className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-sm">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiMail className="text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email Status</p>
                      <p className="text-sm flex items-center gap-1">
                        <FiCheck className="text-green-400" />
                        Verified
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Account Information */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiUser className="text-blue-400" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ""}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Contact support to update your email address or name.
                    </p>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FiLock className="text-purple-400" />
                    Change Password
                  </h3>
                  <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          {...register("oldPassword")}
                          type={showOldPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                            errors.oldPassword ? "border-red-500" : "border-white/20"
                          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showOldPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.oldPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle /> {errors.oldPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          {...register("newPassword")}
                          type={showNewPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                            errors.newPassword ? "border-red-500" : "border-white/20"
                          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle /> {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          className={`w-full px-4 py-3 pr-12 bg-white/10 border ${
                            errors.confirmPassword ? "border-red-500" : "border-white/20"
                          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                          <FiAlertCircle /> {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave />
                          Update Password
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
