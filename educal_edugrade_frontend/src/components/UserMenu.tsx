import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { resolveAssetUrl } from "../services/api";
import EditProfileModal from "./EditProfileModal";

interface UserMenuProps {
  settingsPath?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  lecturer: "Lecturer",
  student: "Student",
};

export function getInitial(username: string | null | undefined): string {
  return username && username.length > 0 ? username[0].toUpperCase() : "?";
}

interface AvatarProps {
  imageUrl?: string;
  username: string | null | undefined;
  size: "sm" | "md";
}

// The avatar shows the user's uploaded photo when they have one; otherwise it
// falls back to an initials badge (the same substitute Slack/GitHub/Notion
// use for a user without a profile picture) rather than a broken image.
// Exported so other places that need to render "this user's picture" (e.g.
// the admin Users list) don't reimplement the fallback logic.
export const Avatar: React.FC<AvatarProps> = ({ imageUrl, username, size }) => {
  const dimensions = size === "sm" ? "w-9 h-9 text-sm" : "w-20 h-20 text-2xl";
  if (imageUrl) {
    return <img src={imageUrl} alt={username ?? "Profile"} className={`${dimensions} rounded-full object-cover`} />;
  }
  return (
    <div className={`${dimensions} rounded-full bg-primary text-white font-semibold flex items-center justify-center`}>
      {getInitial(username)}
    </div>
  );
};

// Current-user avatar for the far-right corner of the top nav. Clicking it
// opens an account menu; clicking "Edit Profile" from there (or the avatar
// inside that menu) opens the profile editor where the photo/name/email can
// be changed.
const UserMenu: React.FC<UserMenuProps> = ({ settingsPath }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const username = user?.username ?? "Account";
  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : "";
  const avatarUrl = resolveAssetUrl(user?.profileImage);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-full shadow-sm ring-2 ring-white hover:ring-primary/30 transition-all overflow-hidden"
          aria-label="Account menu"
          aria-expanded={isOpen}
        >
          <Avatar imageUrl={avatarUrl} username={user?.username} size="sm" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/70 shadow-lg py-2 z-50 animate-fadeIn">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsEditProfileOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 border-b border-slate-100 hover:bg-slate-100/80 text-left"
            >
              <Avatar imageUrl={avatarUrl} username={user?.username} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{username}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setIsEditProfileOpen(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100/80"
            >
              <FiUser className="w-4 h-4" />
              Edit Profile
            </button>

            {settingsPath && (
              <Link
                to={settingsPath}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100/80"
              >
                <FiSettings className="w-4 h-4" />
                Settings
              </Link>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </>
  );
};

export default UserMenu;
