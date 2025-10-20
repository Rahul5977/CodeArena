import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FiCode,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiUsers,
  FiShield,
  FiHome,
  FiList,
  FiPlayCircle,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import useAuthStore from "../stores/authStore";
import ThemeToggle from "./ui/ThemeToggle";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isActivePath = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", icon: FiHome, label: "Dashboard" },
    { to: "/problems", icon: FiList, label: "Problems" },
    { to: "/playlists", icon: FiPlayCircle, label: "Playlists" },
    { to: "/sheets", icon: FiFileText, label: "Sheets" },
    { to: "/contests", icon: FiAward, label: "Contests" },
    { to: "/submissions", icon: FiFileText, label: "Submissions" },
  ];

  const adminLinks = [
    { to: "/admin", icon: FiShield, label: "Admin", roles: ["ADMIN", "SUPERADMIN"] },
    { to: "/admin/users", icon: FiUsers, label: "Users", roles: ["SUPERADMIN"] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-teal-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-teal-500/50 transition-all duration-300">
                <FiCode className="text-white text-xl" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-pink-500 bg-clip-text text-transparent">
              LeetLab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated &&
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(link.to)
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/50"
                      : "text-slate-300 hover:text-teal-400 hover:bg-slate-800/50"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}

            {/* Admin Links */}
            {isAdmin &&
              adminLinks.map((link) => {
                if (link.roles && !link.roles.includes(user?.role)) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(link.to)
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                        : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Profile Button */}
                <Link to="/profile">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white text-sm font-medium shadow-lg hover:shadow-teal-500/50 transition-all duration-200 hover:scale-105 active:scale-95">
                    <FiUser className="w-4 h-4" />
                    <span>{user?.name || "Profile"}</span>
                    {user?.role && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                        {user.role}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-slate-800/50 transition-all duration-200">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white text-sm font-medium shadow-lg hover:shadow-teal-500/50 transition-all duration-200 hover:scale-105 active:scale-95">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800/50 text-white hover:bg-slate-800/70 transition-all duration-200"
          >
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {/* Theme Toggle Mobile */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
              <span className="text-sm font-medium text-slate-300">Theme</span>
              <ThemeToggle />
            </div>

            {isAuthenticated &&
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(link.to)
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/50"
                      : "text-slate-300 hover:text-teal-400 hover:bg-slate-800/50"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}

            {/* Admin Links Mobile */}
            {isAdmin &&
              adminLinks.map((link) => {
                if (link.roles && !link.roles.includes(user?.role)) return null;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all duration-200"
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

            {isAuthenticated && (
              <>
                <div className="border-t border-slate-700/50 my-3"></div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-pink-500 text-white"
                >
                  <FiUser className="w-5 h-5" />
                  <span>{user?.name || "Profile"}</span>
                  {user?.role && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                      {user.role}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-center text-dark-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary hover:bg-dark-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
