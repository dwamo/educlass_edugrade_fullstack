import React from "react";
import { Link, useLocation } from "react-router-dom";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  className?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, to, className = "", onClick, collapsed = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg transition-all duration-200 ${
        collapsed ? "justify-center px-0 py-2.5" : "px-4 py-2"
      } text-slate-700 ${
        isActive
          ? "bg-primary-500 bg-opacity-10 text-primary-500"
          : "hover:bg-slate-100"
      } ${className}`}
    >
      <span className={`text-lg ${isActive ? "text-primary-500" : ""} transition-transform duration-200`}>{icon}</span>
      {!collapsed && (
        <span className={`ml-3 font-medium ${isActive ? "text-primary-500" : ""} transition-all duration-200`}>
          {label}
        </span>
      )}
    </Link>
  );
};

export default MenuItem;