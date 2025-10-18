import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUsers,
  FiShield,
  FiHome,
  FiList,
  FiPlayCircle,
  FiFileText,
  FiAward,
  FiSettings,
} from "react-icons/fi";
import useAuthStore from "../stores/authStore";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Check if user is admin or superadmin
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const isActivePath = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", icon: FiHome, label: "Dashboard", public: false },
    { to: "/problems", icon: FiList, label: "Problems", public: false },
    { to: "/playlists", icon: FiPlayCircle, label: "Playlists", public: false },
    { to: "/sheets", icon: FiFileText, label: "Sheets", public: false },
    { to: "/contests", icon: FiAward, label: "Contests", public: false },
    { to: "/submissions", icon: FiFileText, label: "Submissions", public: false },
  ];

  const adminLinks = [
    { to: "/admin", icon: FiShield, label: "Admin Panel", roles: ["ADMIN", "SUPERADMIN"] },
    { to: "/admin/users", icon: FiUsers, label: "Users", roles: ["SUPERADMIN"] },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <FiCode className="text-white text-xl" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActivePath(link.to)
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <link.icon className="text-lg" />
                  <span className="font-medium">{link.label}</span>
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActivePath(link.to)
                        ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
                        : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Profile Link */}
                <Link to="/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <FiUser />
                    <span className="font-medium">{user?.name || "Profile"}</span>
                    {user?.role && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                        {user.role}
                      </span>
                    )}
                  </motion.button>
                </Link>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200"
                  title="Logout"
                >
                  <FiLogOut className="text-xl" />
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
          >
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated &&
                navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActivePath(link.to)
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <link.icon className="text-xl" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

              {isAdmin &&
                adminLinks.map((link) => {
                  if (link.roles && !link.roles.includes(user?.role)) return null;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-200"
                    >
                      <link.icon className="text-xl" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}

              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <FiUser className="text-xl" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <FiLogOut className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-center text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
                <span className="font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
