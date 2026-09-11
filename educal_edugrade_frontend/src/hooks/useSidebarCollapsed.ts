import { useState } from "react";

const STORAGE_KEY = "sidebar_collapsed";

// Desktop sidebars are remounted on every page (each page wraps its content
// in its own <DashboardLayout>), so the collapsed/expanded choice is kept in
// localStorage rather than component state, which would otherwise reset on
// every navigation.
export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage can be unavailable (private mode, disabled) - collapsed
        // state just won't persist across navigations in that case.
      }
      return next;
    });
  };

  return { isCollapsed, toggle };
}
