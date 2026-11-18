
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Search,
  Bell,
  LogOut
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "../styles/Navbar.css";

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const username = user?.username || "User";

  const userRole =
    user?.role === "admin"
      ? "HR Administrator"
      : "Employee";

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

        <div className="navbar-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
          />
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="notification-btn"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile-section">
          <div className="profile-avatar">
            {username.slice(0, 2).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{username}</strong>
            <small>{userRole}</small>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          type="button"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
