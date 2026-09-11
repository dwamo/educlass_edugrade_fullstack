import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, uploadMyAvatar, resolveAssetUrl } from "../services/api";
import { FiCamera } from "react-icons/fi";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitial(username: string | null | undefined): string {
  return username && username.length > 0 ? username[0].toUpperCase() : "?";
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setPassword("");
    setLoading(true);
    getMyProfile()
      .then((profile) => {
        setUsername(profile.username);
        setEmail(profile.email);
        setAvatarUrl(resolveAssetUrl(profile.profile_image));
      })
      .catch(() => setError("Failed to load your profile. Please try again."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }
    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (selectedFile) {
        await uploadMyAvatar(selectedFile);
      }
      await updateMyProfile({
        username,
        email,
        password: password || undefined,
      });
      await refreshUser();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = previewUrl || avatarUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-sm">Loading your profile...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-20 h-20 rounded-full"
              aria-label="Change profile photo"
            >
              {displayedAvatar ? (
                <img
                  src={displayedAvatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-semibold ring-2 ring-slate-200">
                  {getInitial(username)}
                </div>
              )}
              <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <FiCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Change photo
            </button>
          </div>

          <div>
            <label htmlFor="edit-profile-username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="edit-profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="edit-profile-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="edit-profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="edit-profile-password" className="block text-sm font-medium text-slate-700 mb-1">
              New Password (optional)
            </label>
            <input
              id="edit-profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditProfileModal;
