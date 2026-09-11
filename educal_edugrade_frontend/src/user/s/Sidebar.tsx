import React, { useState } from "react";
import {
  RiDashboardLine,
  RiMedalLine,
  RiCalendarLine,
  RiFileListLine,
  RiBookOpenLine,
  RiSettings4Line,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import URLS from "./url";
import Logo from "../../assets/images/logo.svg";
import MenuItem from "../../components/menu-itens";
import SidebarCollapseToggle from "../../components/SidebarCollapseToggle";
import SidebarAboutButton from "../../components/SidebarAboutButton";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, toggle: toggleCollapsed } = useSidebarCollapsed();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  const sidebarLinks = [
    {
      title: "Dashboard",
      icon: <RiDashboardLine className="text-xl" />,
      url: URLS.DASHBOARD,
    },
    {
      title: "Exams",
      icon: <RiMedalLine className="text-xl" />,
      url: URLS.EXAMS,
    },
    {
      title: "Schedule",
      icon: <RiCalendarLine className="text-xl" />,
      url: URLS.SCHEDULE,
    },
    {
      title: "Classes",
      icon: <RiFileListLine className="text-xl" />,
      url: URLS.CLASSES,
    },
    {
      title: "Results",
      icon: <RiBookOpenLine className="text-xl" />,
      url: URLS.RESULTS,
    },
    {
      title: "Settings",
      icon: <RiSettings4Line className="text-xl" />,
      url: URLS.SETTINGS,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-md shadow-sm md:hidden hover:bg-slate-100"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <RiCloseLine className="w-6 h-6 text-slate-600" />
        ) : (
          <RiMenuLine className="w-6 h-6 text-slate-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
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
              <img src={Logo} alt="EduClass Logo" className="w-28" />
              <p className="text-sm text-slate-500 mt-1">Student Portal</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 h-full">
            {/* Navigation Links */}
            <div className="flex-grow">
              {sidebarLinks.map((link, index) => (
                <div
                  key={link.url}
                  className="animate-slideInLeft mb-2"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <MenuItem
                    to={link.url}
                    icon={link.icon}
                    label={link.title}
                    className="sidebar-item"
                    collapsed={isCollapsed}
                  />
                </div>
              ))}
            </div>

            {/* About */}
            <div
              className="pt-2 border-slate-200 border-t animate-fadeIn"
              style={{ animationDelay: "0.3s" }}
            >
              <SidebarAboutButton isCollapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;