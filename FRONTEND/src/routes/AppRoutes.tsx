import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

// Layouts
import { ManagerLayout } from "../layouts/ManagerLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";

// Common Pages
import { AccessDeniedPage } from "../components/common/AccessDeniedPage";

// Manager Pages
import { DashboardPage } from "../pages/manager/DashboardPage";
import { ProductsPage } from "../pages/manager/ProductsPage";
import { WarehousesPage } from "../pages/manager/WarehousesPage";
import { WarehouseDetailPage } from "../pages/manager/WarehouseDetailPage";
import { InventoryPage } from "../pages/manager/InventoryPage";
import { StockOperationsPage } from "../pages/manager/StockOperationsPage";
import { TransfersPage } from "../pages/manager/TransfersPage";
import { ProcurementPage } from "../pages/manager/ProcurementPage";
import { SuppliersPage } from "../pages/manager/SuppliersPage";
import { SmartInventoryPage } from "../pages/manager/SmartInventoryPage";
import { BarcodeScannerPage } from "../pages/manager/BarcodeScannerPage";
import { BatchesTrackingPage } from "../pages/manager/BatchesTrackingPage";
import { AnalyticsPage } from "../pages/manager/AnalyticsPage";
import { AlertsPage } from "../pages/manager/AlertsPage";
import { ReconciliationPage } from "../pages/manager/ReconciliationPage";
import { TransactionsPage } from "../pages/manager/TransactionsPage";
import { OrdersPage } from "../pages/manager/OrdersPage";
import { HelpPage } from "../pages/manager/HelpPage";

// Admin Pages
import { AdminOverviewPage } from "../pages/admin/AdminOverviewPage";
import { ManagersListPage } from "../pages/admin/ManagersListPage";
import { AddManagerPage } from "../pages/admin/AddManagerPage";
import { ManagerDetailPage } from "../pages/admin/ManagerDetailPage";
import { EditManagerPage } from "../pages/admin/EditManagerPage";

import { UsersPage } from "../pages/admin/UsersPage";
import { RolesPage } from "../pages/admin/RolesPage";
import { AccessControlPage } from "../pages/admin/AccessControlPage";
import { AuditLogsPage } from "../pages/admin/AuditLogsPage";
import { AnalyticsReportsPage } from "../pages/admin/AnalyticsReportsPage";
import { SettingsPage } from "../pages/admin/SettingsPage";

// Customer Pages
import { ProductListingPage } from "../pages/customer/ProductListingPage";
import { ProductDetailPage } from "../pages/customer/ProductDetailPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { MyOrdersPage } from "../pages/customer/MyOrdersPage";
import { CategoriesBrandsView } from "../components/products/CategoriesBrandsView";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Route: Redirect / to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Standalone Access Denied Route */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Customer Storefront Routes (PUBLIC) */}
      <Route element={<CustomerLayout />}>
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories" element={<CategoriesBrandsView />} />
        <Route path="/brands" element={<CategoriesBrandsView />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Customer Legacy/Alias Routes */}
        <Route path="/customer/products" element={<ProductListingPage />} />
        <Route path="/customer/products/:id" element={<ProductDetailPage />} />
        <Route path="/customer/cart" element={<CartPage />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/customer/checkout" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/customer/orders" element={<MyOrdersPage />} />
        </Route>
      </Route>

      {/* Operational Management Routes (Accessible by MANAGER & ADMIN) */}
      <Route element={<RoleRoute allowedRoles={["MANAGER", "ADMIN"]} />}>
        <Route element={<ManagerLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/manager/products" element={<ProductsPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/stock-operations" element={<StockOperationsPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/smart-inventory" element={<SmartInventoryPage />} />
          <Route path="/barcode-scanner" element={<BarcodeScannerPage />} />
          <Route path="/batches" element={<BatchesTrackingPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Low Stock Routes */}
          <Route path="/low-stock" element={<AlertsPage />} />
          <Route path="/inventory/low-stock" element={<AlertsPage />} />

          {/* Reconciliation Routes */}
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="/inventory/reconcile" element={<ReconciliationPage />} />
          <Route path="/inventory/reconciliation" element={<ReconciliationPage />} />

          {/* Transactions Routes */}
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/inventory/transactions" element={<TransactionsPage />} />
          <Route path="/manager/transactions" element={<TransactionsPage />} />

          <Route path="/orders" element={<OrdersPage />} />

          {/* Admin Control Center Protected Routes (Strictly ADMIN Only) */}
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/overview" element={<AdminOverviewPage />} />
            <Route path="/admin/system" element={<AdminOverviewPage />} />

            {/* Managers */}
            <Route path="/admin/managers" element={<ManagersListPage />} />
            <Route path="/admin/managers/add" element={<AddManagerPage />} />
            <Route path="/admin/managers/:id" element={<ManagerDetailPage />} />
            <Route path="/admin/managers/:id/edit" element={<EditManagerPage />} />

            {/* Users */}
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/roles" element={<RolesPage />} />

            {/* Security */}
            <Route path="/admin/access-control" element={<AccessControlPage />} />
            <Route path="/admin/security/access-control" element={<AccessControlPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/security/audit-logs" element={<AuditLogsPage />} />

            {/* Reports & Settings */}
            <Route path="/admin/reports" element={<AnalyticsReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
