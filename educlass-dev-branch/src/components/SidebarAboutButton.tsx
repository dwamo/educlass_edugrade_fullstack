import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import AboutModal from "./AboutModal";

interface SidebarAboutButtonProps {
  isCollapsed: boolean;
}

const SidebarAboutButton: React.FC<SidebarAboutButtonProps> = ({ isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={isCollapsed ? "About" : undefined}
        className={`flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md transition-colors hover:bg-slate-100/80 hover:text-slate-900 ${
          isCollapsed ? "md:justify-center" : ""
        }`}
      >
        <FiInfo className="w-5 h-5" />
        <span className={isCollapsed ? "ml-3 md:hidden" : "ml-3"}>About</span>
      </button>

      <AboutModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default SidebarAboutButton;
