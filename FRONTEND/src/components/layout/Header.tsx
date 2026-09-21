import React from "react";
import { Menu, Bell, User, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../common/Badge";

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
  const { user, role } = useAuth();
  const handleToggle = onToggleSidebar || onOpenMobileSidebar;

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {handleToggle && (
          <button
            onClick={handleToggle}
            aria-label="Toggle Navigation Sidebar"
            aria-expanded={!isCollapsed}
            aria-controls="sidebar-navigation"
            title={isCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex items-center justify-center shrink-0"
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-indigo-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[200px] sm:max-w-none">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative">
          <button
            title="Notifications"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-200 block">{user?.username}</span>
            <Badge variant={role === "ADMIN" ? "purple" : "info"} size="sm">
              {role}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
