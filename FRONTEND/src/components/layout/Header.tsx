import React, { useState, useRef, useEffect } from "react";
import { Bell, User, PanelLeftClose, PanelLeft, ChevronDown, LogOut, Settings, UserCircle, Key } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const handleToggle = onToggleSidebar || onOpenMobileSidebar;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30" style={{ height: 60 }}>
      {/* LEFT: Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {handleToggle && (
          <button
            onClick={handleToggle}
            aria-label="Toggle Navigation Sidebar"
            aria-expanded={!isCollapsed}
            aria-controls="sidebar-navigation"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 cursor-pointer flex items-center justify-center shrink-0"
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-[#111111]" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}
        <span className="text-sm font-semibold text-gray-500 truncate hidden sm:block">{title}</span>
      </div>

      {/* RIGHT: Bell + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications */}
        <button
          title="Notifications"
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#111111] border-2 border-white" />
        </button>

        <div className="h-5 w-px bg-gray-200" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-center text-[#555555] shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-gray-900 block leading-tight">{user?.username ?? "User"}</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide leading-tight">{role}</span>
            </div>
            <ChevronDown className={"w-3.5 h-3.5 text-gray-400 transition-transform duration-200 " + (profileOpen ? "rotate-180" : "")} />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/10 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{role}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/forgot-password"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Key className="w-4 h-4 text-gray-400" />
                  Change Password
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
