import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiSettings,
  FiCode,
  FiBook,
  FiAward,
  FiTarget,
  FiHome,
  FiBookOpen,
} from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "SUPERADMIN":
        return "badge-error";
      case "ADMIN":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  const navigationItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/problems", label: "Problems", icon: FiCode },
    { path: "/playlists", label: "Playlists", icon: FiBookOpen },
    { path: "/sheets", label: "Sheets", icon: FiBook },
    { path: "/contests", label: "Contests", icon: FiAward },
    { path: "/submissions", label: "Submissions", icon: FiTarget },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-lg border-b border-base-200 fixed top-0 z-50 px-4">
        <div className="navbar-start">
          <button className="btn btn-ghost lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <RouterLink to="/" className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <FiCode className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LeetLab
            </span>
          </RouterLink>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            {navigationItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <RouterLink
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-base-200 ${
                    isActivePath(path)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-base-content hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end gap-2">
          {/* Notifications */}
          <button className="btn btn-ghost btn-circle hover:bg-base-200">
            <div className="indicator">
              <FiBell size={18} />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:bg-base-200"
            >
              <div className="w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <img
                  alt={user?.name}
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`
                  }
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-60 p-3 shadow-xl border border-base-200"
            >
              <li className="menu-title px-0 py-3">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt={user?.name}
                        src={
                          user?.image ||
                          `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`
                        }
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base-content">{user?.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-base-content/60">{user?.email}</span>
                      <span className={`badge badge-xs ${getRoleColor(user?.role)}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </li>

              <div className="divider my-2"></div>

              <li>
                <RouterLink to="/profile" className="flex items-center gap-3 py-2">
                  <FiUser size={16} />
                  <span>Profile</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/settings" className="flex items-center gap-3 py-2">
                  <FiSettings size={16} />
                  <span>Settings</span>
                </RouterLink>
              </li>

              <div className="divider my-2"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-2 text-error hover:bg-error/10"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-base-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <FiCode className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  LeetLab
                </span>
              </div>
            </div>

            <div className="p-4">
              <ul className="menu menu-compact gap-2">
                {navigationItems.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <RouterLink
                      to={path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath(path)
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-base-content hover:bg-base-200 hover:text-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={18} />
                      {label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
