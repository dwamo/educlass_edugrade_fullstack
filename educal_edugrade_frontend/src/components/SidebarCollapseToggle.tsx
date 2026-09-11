import React from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

interface SidebarCollapseToggleProps {
  isCollapsed: boolean;
  onClick: () => void;
}

// A floating pill handle docked on the sidebar's edge, half-overlapping the
// content area - the same affordance pattern used by Notion/Linear-style
// desktop apps, rather than a plain inline button sitting in the header row.
const SidebarCollapseToggle: React.FC<SidebarCollapseToggleProps> = ({ isCollapsed, onClick }) => (
  <button
    onClick={onClick}
    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    className="hidden md:flex absolute top-8 -right-3 z-50 w-6 h-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:text-primary hover:scale-110 active:scale-95"
  >
    {isCollapsed ? <RiArrowRightSLine className="w-4 h-4" /> : <RiArrowLeftSLine className="w-4 h-4" />}
  </button>
);

export default SidebarCollapseToggle;
