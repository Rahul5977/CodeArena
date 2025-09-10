import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCode,
  FiList,
  FiFileText,
  FiUser,
  FiSettings,
  FiUsers,
//   FiCode,
  FiBook,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: FiHome, path: "/" },
    { name: "Problems", icon: FiCode, path: "/problems" },
    { name: "Playlists", icon: FiList, path: "/playlists" },
    { name: "Contests", icon: FiCode, path: "/contests" },
    { name: "Sheets", icon: FiBook, path: "/sheets" },
    { name: "Submissions", icon: FiFileText, path: "/submissions" },
    { name: "Profile", icon: FiUser, path: "/profile" },
  ];

  const adminItems = [
    { name: "Admin Panel", icon: FiSettings, path: "/admin" },
    { name: "User Management", icon: FiUsers, path: "/admin/users" },
    { name: "Contest Management", icon: FiCode, path: "/admin/contests" },
    { name: "Sheet Management", icon: FiBook, path: "/admin/sheets" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer-side fixed top-16 left-0 h-screen w-64 bg-base-100 shadow-lg z-40 hidden md:block">
      <div className="h-full overflow-y-auto">
        <ul className="menu p-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <RouterLink
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  isActive(item.path)
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200"
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </RouterLink>
            </li>
          ))}
          
          {isAdmin() && (
            <>
              <div className="divider"></div>
              <li className="menu-title">
                <span>Admin</span>
              </li>
              {adminItems.map((item) => (
                <li key={item.name}>
                  <RouterLink
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive(item.path)
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </RouterLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;