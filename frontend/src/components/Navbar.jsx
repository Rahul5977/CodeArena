import { useState } from 'react'
import { useAuth } from "../contexts/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FiBell, FiMenu, FiX, FiLogOut } from 'react-icons/fi'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="navbar bg-base-100 shadow-lg fixed top-0 z-50">
      <div className="navbar-start">
        <button 
          className="btn btn-ghost md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <RouterLink to="/" className="btn btn-ghost text-xl font-bold text-primary">
          LeetLab
        </RouterLink>
      </div>
      
      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <FiBell size={20} />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img 
                alt={user?.name} 
                src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`} 
              />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li className="menu-title">
              <span>{user?.name}</span>
              <span className={`badge badge-sm ${getRoleColor(user?.role)}`}>
                {user?.role}
              </span>
            </li>
            <li><RouterLink to="/profile">Profile</RouterLink></li>
            <li><RouterLink to="/settings">Settings</RouterLink></li>
            <li>
              <button onClick={handleLogout} className="flex items-center gap-2">
                <FiLogOut size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;