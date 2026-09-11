import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiBarChart2,
  FiBookOpen,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import Logo from "../../assets/images/logo.svg";
import SidebarCollapseToggle from "../../components/SidebarCollapseToggle";
import SidebarAboutButton from "../../components/SidebarAboutButton";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";

interface SidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, toggle: toggleCollapsed } = useSidebarCollapsed();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      icon: <FiHome className="w-5 h-5" />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <FiBook className="w-5 h-5" />,
      label: "Programs",
      path: "/admin/programs",
      subItems: [
        {
          label: "Analytics",
          path: "/admin/programs/analytics",
        },
      ],
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      label: "Lecturers",
      path: "/admin/lecturers",
    },
    {
      icon: <FiUser className="w-5 h-5" />,
      label: "Students",
      path: "/admin/students",
    },
    {
      icon: <FiBookOpen className="w-5 h-5" />,
      label: "Courses",
      path: "/admin/courses",
    },
    {
      icon: <FiBarChart2 className="w-5 h-5" />,
      label: "Analytics",
      path: "/admin/analytics",
      subItems: [
        {
          label: "Main Analytics",
          path: "/admin/analytics",
        },
        {
          label: "Student Analytics",
          path: "/admin/analytics/students",
        },
        {
          label: "Course Analytics",
          path: "/admin/analytics/courses",
        },
      ],
    },
    {
      icon: <FiUsers className="w-5 h-5" />, // Icon for Users
      label: "Users", // Label for Users
      path: "/admin/users", // Path for Users
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-md shadow-sm md:hidden hover:bg-slate-100"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <FiX className="w-6 h-6 text-slate-600" />
        ) : (
          <FiMenu className="w-6 h-6 text-slate-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static w-72 ${isCollapsed ? "md:w-20" : "md:w-72"} bg-white/80 backdrop-blur-md border-r-2 border-slate-200/70 h-[100dvh]
          z-40 transition-transform md:transition-[width] duration-300 ease-in-out shrink-0 relative
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${className || ""}
        `}
      >
      <SidebarCollapseToggle isCollapsed={isCollapsed} onClick={toggleCollapsed} />
      <div className="p-4 flex flex-col h-full overflow-y-auto">
        <div className={`pb-4 w-full flex items-center ${isCollapsed ? "md:justify-center" : ""}`}>
          <div className={isCollapsed ? "md:hidden" : ""}>
            <img src={Logo} alt="Logo" className="w-28" />
            <p className="text-sm text-slate-500 mt-1">Admin Portal</p>
          </div>
        </div>
        <div className="flex flex-col h-full justify-between">
          <nav className="flex flex-col mt-4 space-y-1">
            {navItems.map((item, index) => (
              <div
                key={item.path}
                className="animate-slideInLeft"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isCollapsed ? "md:justify-center" : ""
                  } ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  <span className={isCollapsed ? "ml-3 md:hidden" : "ml-3"}>{item.label}</span>
                </Link>
              </div>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-200">
            <SidebarAboutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
      </aside>
    </>
  );
};

export default AdminSidebar;