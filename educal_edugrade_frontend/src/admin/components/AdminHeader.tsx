import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import UserMenu from "../../components/UserMenu";

interface AdminHeaderProps {
  title?: string;
  showAddButton?: boolean;
  onAddButton?: () => void;
  buttonTitle?: string;
}

// The admin section is mounted once with a single, static <AdminLayout> at
// the top of the route tree (see App.tsx), so the header can't receive a
// per-page title as a prop the way the lecturer/student layouts do. Instead
// it derives one from the current route. Create/edit no longer have their
// own routes (those forms open as modals from each list page), so this only
// needs to resolve list pages and the two remaining detail views.
const PAGE_TITLES: Record<string, string> = {
  "dashboard": "Dashboard",
  "programs": "Programs",
  "lecturers": "Lecturers",
  "students": "Students",
  "courses": "Courses",
  "analytics": "Analytics",
  "analytics/students": "Student Analytics",
  "analytics/courses": "Course Analytics",
  "users": "Users",
};

function getAdminPageTitle(pathname: string): string {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";

  const exact = PAGE_TITLES[segments.join("/")];
  if (exact) return exact;

  // Dynamic segment: /<section>/:id (e.g. programs/3, courses/3)
  const [section] = segments;
  const label = PAGE_TITLES[section]?.replace(/s$/, "") ?? "Item";
  if (segments.length === 2) return `${label} Details`;
  return PAGE_TITLES[section] ?? "Admin";
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  showAddButton = false,
  onAddButton,
  buttonTitle = "Add New"
}) => {
  const location = useLocation();
  const title = getAdminPageTitle(location.pathname);

  return (
    <>
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/70 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {showAddButton && (
            <button
              onClick={onAddButton}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {buttonTitle}
            </button>
          )}
          <UserMenu />
        </div>
      </header>
      <Breadcrumb title={title} />
    </>
  );
};

export default AdminHeader; 