import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Warehouse as WarehouseIcon,
  Boxes,
  AlertTriangle,
  FileCheck2,
  History,
  ShoppingCart,
  ShieldCheck,
  Users,
  UserCheck,
  BarChart3,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  User,
  X,
  Lock,
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleExpand?: () => void;
  onCloseMobile?: () => void;
}

interface NavSubItem {
  label: string;
  path: string;
}

interface NavGroupItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavSubItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleExpand,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { user, role, logout } = useAuth();

  // Management section items
  const managementItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Products", path: "/products", icon: Package },
    { label: "Warehouses", path: "/warehouses", icon: WarehouseIcon },
    { label: "Inventory", path: "/inventory", icon: Boxes },
    { label: "Low Stock", path: "/low-stock", icon: AlertTriangle },
    { label: "Reconciliation", path: "/reconciliation", icon: FileCheck2 },
    { label: "Transactions", path: "/transactions", icon: History },
    { label: "Orders", path: "/orders", icon: ShoppingCart },
  ];

  // Restructured Administration section items
  const adminGroups: NavGroupItem[] = [
    {
      id: "overview",
      label: "Overview",
      path: "/admin/overview",
      icon: LayoutDashboard,
    },
    {
      id: "managers",
      label: "Managers",
      icon: UserCheck,
      items: [
        { label: "Add Manager", path: "/admin/managers/add" },
        { label: "All Managers", path: "/admin/managers" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      items: [
        { label: "All Users", path: "/admin/users" },
        { label: "Roles", path: "/admin/roles" },
      ],
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
      items: [
        { label: "Access Control", path: "/admin/access-control" },
        { label: "Audit Logs", path: "/admin/audit-logs" },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      path: "/admin/settings",
      icon: SettingsIcon,
    },
  ];

  // Single Source of Truth for Exclusive Accordion Behavior:
  const [openSectionId, setOpenSectionId] = useState<string | null>(() => {
    for (const group of adminGroups) {
      if (group.items && group.items.some((item) => location.pathname === item.path)) {
        return group.id;
      }
    }
    return null;
  });

  // Auto-expand current active nested section on location change
  useEffect(() => {
    adminGroups.forEach((group) => {
      if (group.items && group.items.some((item) => location.pathname === item.path)) {
        setOpenSectionId(group.id);
      }
    });
  }, [location.pathname]);

  // Exclusive Accordion Toggle logic
  const toggleGroup = (groupId: string) => {
    setOpenSectionId((prev) => (prev === groupId ? null : groupId));
  };

  const handleCollapsedGroupClick = (groupId: string) => {
    if (onToggleExpand) {
      onToggleExpand();
    }
    setOpenSectionId(groupId);
  };

  const isAdmin = role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "ROLE_ADMIN";

  return (
    <aside
      id="sidebar-navigation"
      aria-label="Sidebar Navigation"
      className={`bg-slate-950 border-r border-slate-800/80 flex flex-col h-full text-left shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 sm:p-6 border-b border-slate-800/80 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div
            className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30 text-white shrink-0"
            title="StockFlow Inventory SaaS"
          >
            <Boxes className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-black tracking-tight text-white leading-none truncate">StockFlow</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 truncate block mt-0.5">
                Inventory SaaS
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
            title="Close Sidebar"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List - Vertical Scroll Only, No Horizontal Scroll */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-2.5 py-4" : "px-4 py-6"} flex flex-col gap-6`}>
        {/* MANAGEMENT SECTION */}
        <div className="flex flex-col gap-1.5">
          {!isCollapsed ? (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
              Management
            </span>
          ) : (
            <div className="flex justify-center mb-1">
              <span className="w-5 h-0.5 bg-slate-800 rounded-full" title="Management" />
            </div>
          )}

          {managementItems.map((item) => {
            const Icon = item.icon;

            if (isCollapsed) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={onCloseMobile}
                  title={item.label}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* ADMINISTRATION SECTION (ADMIN ONLY) */}
        {isAdmin && (
          <div className="flex flex-col gap-1.5 border-t border-slate-800/80 pt-4">
            {!isCollapsed ? (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center justify-between">
                <span>Administration</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[9px] font-bold text-indigo-300">
                  ADMIN
                </span>
              </span>
            ) : (
              <div className="flex justify-center mb-1">
                <span className="w-5 h-0.5 bg-indigo-500/40 rounded-full" title="Administration" />
              </div>
            )}

            {adminGroups.map((group) => {
              const Icon = group.icon;

              // Direct link group (non-expandable)
              if (group.path && !group.items) {
                if (isCollapsed) {
                  return (
                    <NavLink
                      key={group.id}
                      to={group.path}
                      end
                      onClick={onCloseMobile}
                      title={group.label}
                      aria-label={group.label}
                      className={({ isActive }) =>
                        `flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={group.id}
                    to={group.path}
                    end
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{group.label}</span>
                  </NavLink>
                );
              }

              // Collapsible group with exclusive accordion behavior
              const isOpen = openSectionId === group.id;
              const isAnySubActive = group.items?.some((sub) => location.pathname === sub.path);

              if (isCollapsed) {
                return (
                  <button
                    key={group.id}
                    onClick={() => handleCollapsedGroupClick(group.id)}
                    title={`${group.label} (Click to expand)`}
                    aria-label={`${group.label} (Click to expand)`}
                    className={`flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isAnySubActive
                        ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                  </button>
                );
              }

              return (
                <div key={group.id} className="flex flex-col gap-0.5">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    aria-controls={`submenu-${group.id}`}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left cursor-pointer focus:outline-none ${
                      isAnySubActive
                        ? "text-indigo-400 font-semibold bg-slate-900/80"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{group.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                        isOpen ? "rotate-90 text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Sub-items panel */}
                  {isOpen && group.items && (
                    <div
                      id={`submenu-${group.id}`}
                      className="ml-4 pl-3 border-l border-slate-800 flex flex-col gap-1 py-1 transition-all duration-200 ease-in-out"
                    >
                      {group.items.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          end
                          onClick={onCloseMobile}
                          className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-indigo-600/90 text-white font-semibold shadow-md shadow-indigo-600/20"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/50">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400"
              title={`${user?.username || "User"} (${role})`}
            >
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-200 block truncate">{user?.username}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400">{role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
