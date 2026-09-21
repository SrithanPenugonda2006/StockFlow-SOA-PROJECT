import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Warehouse as WarehouseIcon,
  Boxes,
  ArrowRightLeft,
  Truck,
  ShoppingBag,
  Sparkles,
  Barcode,
  QrCode,
  BarChart3,
  Bell,
  FileCheck2,
  History,
  ShoppingCart,
  HelpCircle,
  ShieldCheck,
  Users,
  UserCheck,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  User,
  X,
  Boxes as StockFlowLogo,
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
    { label: "Stock Operations", path: "/stock-operations", icon: Boxes },
    { label: "Transfers", path: "/transfers", icon: ArrowRightLeft },
    { label: "Procurement", path: "/procurement", icon: ShoppingBag },
    { label: "Suppliers", path: "/suppliers", icon: Truck },
    { label: "Smart Inventory", path: "/smart-inventory", icon: Sparkles },
    { label: "Barcode Scanner", path: "/barcode-scanner", icon: Barcode },
    { label: "Batch & Serial Tracking", path: "/batches", icon: QrCode },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "System Alerts", path: "/alerts", icon: Bell },
    { label: "Reconciliation", path: "/reconciliation", icon: FileCheck2 },
    { label: "Transactions", path: "/transactions", icon: History },
    { label: "Orders", path: "/orders", icon: ShoppingCart },
    { label: "System Help", path: "/help", icon: HelpCircle },
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

  const isAdmin = role === "ADMIN";

  // Auto-expand active admin group on load
  const [openSectionId, setOpenSectionId] = useState<string | null>(() => {
    const activeGroup = adminGroups.find((g) =>
      g.items?.some((sub) => location.pathname === sub.path)
    );
    return activeGroup ? activeGroup.id : "managers";
  });

  useEffect(() => {
    const activeGroup = adminGroups.find((g) =>
      g.items?.some((sub) => location.pathname === sub.path)
    );
    if (activeGroup) {
      setOpenSectionId(activeGroup.id);
    }
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  const handleCollapsedGroupClick = (id: string) => {
    if (onToggleExpand) {
      onToggleExpand();
    }
    setOpenSectionId(id);
  };

  return (
    <aside
      id="sidebar-navigation"
      className={`bg-[#050505] text-[#D1D5DB] border-r border-[#262626] flex flex-col h-full transition-all duration-300 z-40 select-none ${
        isCollapsed ? "w-16 sm:w-20" : "w-64 sm:w-72"
      }`}
    >
      {/* Top Header Logo */}
      <div className="p-4 sm:p-5 border-b border-[#262626] flex items-center justify-between">
        <NavLink to="/dashboard" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-[#111111] text-white group-hover:scale-105 transition-transform shrink-0">
            <StockFlowLogo className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <span className="text-base font-extrabold tracking-wide text-white uppercase font-sans">
                STOCKFLOW
              </span>
              <span className="text-[10px] font-semibold text-[#9CA3AF] tracking-widest uppercase">
                INVENTORY SAAS
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#171717] transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar text-left">
        {/* Operations Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2 block">
              Operations
            </span>
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
                    `flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                      isActive
                        ? "bg-[#1F1F1F] text-white font-semibold border border-[#333333]"
                        : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
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
                  `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#1F1F1F] text-white font-semibold border border-[#333333]"
                      : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Administration Section (ADMIN Only) */}
        {isAdmin && (
          <div className="space-y-1 pt-3 border-t border-[#262626]">
            {!isCollapsed ? (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-2 flex items-center justify-between">
                <span>Administration</span>
                <span className="px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[9px] font-bold text-[#9CA3AF] border border-[#333333]">
                  ADMIN
                </span>
              </span>
            ) : (
              <div className="flex justify-center mb-2">
                <span className="w-5 h-0.5 bg-gray-600 rounded-full" title="Administration" />
              </div>
            )}

            {adminGroups.map((group) => {
              const Icon = group.icon;

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
                        `flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                          isActive
                            ? "bg-[#1F1F1F] text-white font-semibold border border-[#333333]"
                            : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
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
                      `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-[#1F1F1F] text-white font-semibold border border-[#333333]"
                          : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{group.label}</span>
                  </NavLink>
                );
              }

              const isOpen = openSectionId === group.id;
              const isAnySubActive = group.items?.some((sub) => location.pathname === sub.path);

              if (isCollapsed) {
                return (
                  <button
                    key={group.id}
                    onClick={() => handleCollapsedGroupClick(group.id)}
                    title={`${group.label} (Click to expand)`}
                    aria-label={`${group.label} (Click to expand)`}
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                      isAnySubActive
                        ? "bg-[#1F1F1F] text-white border border-[#333333] font-semibold"
                        : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
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
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 w-full text-left cursor-pointer focus:outline-none ${
                      isAnySubActive
                        ? "text-white font-semibold bg-[#1F1F1F]"
                        : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{group.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        isOpen ? "rotate-90 text-white" : ""
                      }`}
                    />
                  </button>

                  {isOpen && group.items && (
                    <div
                      id={`submenu-${group.id}`}
                      className="ml-4 pl-3 border-l border-[#262626] flex flex-col gap-1 py-1 transition-all duration-200 ease-in-out"
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
                                ? "bg-[#1F1F1F] text-white font-semibold border border-[#333333]"
                                : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171717]"
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
      <div className="p-3 sm:p-4 border-t border-[#262626] bg-[#111111]">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="p-2 rounded-xl bg-[#171717] border border-[#262626] text-[#9CA3AF]"
              title={`${user?.username || "User"} (${role})`}
            >
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-[#9CA3AF] hover:text-gray-900 hover:bg-[#171717] rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#171717] border border-[#262626]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-[#9CA3AF]">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{user?.username}</span>
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">{role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-[#9CA3AF] hover:text-gray-900 hover:bg-[#1F1F1F] rounded-lg transition-colors cursor-pointer"
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
