
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Wallet,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ListTodo,
  FolderOpen,
  Settings,
  X
} from "lucide-react";

import "../styles/Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Attendance", path: "/attendance", icon: CalendarCheck },
  { name: "Leaves", path: "/leaves", icon: CalendarDays },
  { name: "Payroll", path: "/payroll", icon: Wallet },
  { name: "Recruitment", path: "/recruitment", icon: BriefcaseBusiness },
  { name: "Performance", path: "/performance", icon: ChartNoAxesCombined },
  { name: "Tasks", path: "/tasks", icon: ListTodo },
  { name: "Documents", path: "/documents", icon: FolderOpen }
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Users size={22} />
            </div>

            <div className="brand-text">
              <span>SmartHR</span>
              <small>Management System</small>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <div className="sidebar-footer">
            <div className="footer-avatar">HR</div>

            <div className="footer-info">
              <strong>SmartHRMS</strong>
              <small>Management Portal</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
