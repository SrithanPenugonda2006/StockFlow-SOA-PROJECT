import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";

export const ManagerLayout: React.FC = () => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      // Default to collapsed rail on tablet widths (768px - 1199px)
      return window.innerWidth >= 768 && window.innerWidth < 1200;
    }
    return false;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // Close mobile drawer or toggle sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsDesktopCollapsed((prev) => !prev);
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const getPageTitle = (pathname: string) => {
    if (pathname.includes("/products")) return "Catalog Products Management";
    if (pathname.includes("/warehouses")) return "Physical Warehouses Control";
    if (pathname.includes("/inventory") && !pathname.includes("/low-stock") && !pathname.includes("/reconcil") && !pathname.includes("/transaction")) return "Multi-Warehouse Inventory Ledger";
    if (pathname.includes("/low-stock")) return "Critical Low-Stock Monitoring";
    if (pathname.includes("/reconcil")) return "Physical Audit & Stock Reconciliation";
    if (pathname.includes("/transaction")) return "Inventory Audit Transaction Logs";
    if (pathname.includes("/orders")) return "Customer Order Fulfillment";
    if (pathname.includes("/admin/system") || pathname.includes("/admin/overview")) return "System Architecture Overview";
    if (pathname.includes("/admin/managers")) return "Manager User Administration";
    if (pathname.includes("/admin/users")) return "System Users Management";
    if (pathname.includes("/admin/roles")) return "Role-Based Access Control Roles";
    if (pathname.includes("/admin/access-control")) return "Access Control Matrix";
    if (pathname.includes("/admin/audit-logs")) return "Security Audit Logs";
    if (pathname.includes("/admin/reports")) return "System Analytics & Reports";
    if (pathname.includes("/admin/settings")) return "System Settings";
    return "Executive Operations Dashboard";
  };

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-gray-900 overflow-hidden">
      {/* Desktop / Tablet Sidebar (Collapsible Rail) */}
      <div className="hidden md:block h-full shrink-0 z-30 transition-all duration-300 ease-in-out">
        <Sidebar
          isCollapsed={isDesktopCollapsed}
          onToggleExpand={() => setIsDesktopCollapsed(false)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sliding Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Sidebar Container */}
          <div className="relative z-10 w-64 h-full shadow-2xl transition-transform transform duration-300 ease-in-out">
            <Sidebar
              isCollapsed={false}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          title={getPageTitle(location.pathname)}
          isCollapsed={isDesktopCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
