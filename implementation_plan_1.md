# StockFlow - Production-Quality Frontend Implementation Plan

**StockFlow: Multi-Warehouse Inventory Control & Stock Reconciliation System**
*Problem Statement: PS017*

---

## 🎯 Project Overview & Objectives

The goal is to build a complete, modern, production-grade frontend application for **StockFlow** using **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router v7**, **TanStack Query (v5)**, **Axios**, **React Hook Form**, **Zod**, **Recharts**, and **Lucide Icons**.

The frontend will integrate directly with the running **OmniStock Microservices Backend** via the central **API Gateway** (`http://localhost:8080`).

---

## 🔍 Backend Integration & API Contract Mapping

| Microservice | API Route (Gateway) | Endpoint | Method | Role / Auth | Frontend Integration Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth Service** | `/api/auth` | `/api/auth/login` | `POST` | Public | Authentication & JWT token issuance |
| **Auth Service** | `/api/auth` | `/api/auth/register` | `POST` | Public | User registration (`ADMIN`, `MANAGER`, `CUSTOMER`) |
| **Product Service** | `/api/products` | `/api/products` | `GET` | Public | Paginated product listing & search |
| **Product Service** | `/api/products` | `/api/products/{id}` | `GET` | Public | Product details & multi-warehouse stock breakdown |
| **Product Service** | `/api/products` | `/api/products` | `POST` | `ADMIN` | Catalog product creation |
| **Product Service** | `/api/products` | `/api/products/{id}` | `PUT` | `ADMIN` | Catalog product editing |
| **Product Service** | `/api/products` | `/api/products/{id}` | `DELETE` | `ADMIN` | Catalog product deletion |
| **Inventory Service**| `/api/inventory` | `/api/inventory/warehouses` | `GET` / `POST` | `MANAGER`, `ADMIN` | Warehouse listing & creation |
| **Inventory Service**| `/api/inventory` | `/api/inventory/warehouses/{id}` | `PUT` / `DELETE` | `MANAGER`, `ADMIN` | Warehouse modification & deletion |
| **Inventory Service**| `/api/inventory` | `/api/inventory` | `POST` / `PUT` | `MANAGER`, `ADMIN` | Stock initialization & updates |
| **Inventory Service**| `/api/inventory` | `/api/inventory/product/{id}` | `GET` | Public | Warehouse stock breakdown for product |
| **Inventory Service**| `/api/inventory` | `/api/inventory/low-stock` | `GET` | `MANAGER`, `ADMIN` | Low-stock critical alerts & threshold monitoring |
| **Inventory Service**| `/api/inventory` | `/api/inventory/reconcile` | `POST` | `MANAGER`, `ADMIN` | Physical stock audit reconciliation |
| **Inventory Service**| `/api/inventory` | `/api/inventory/transactions` | `GET` | `MANAGER`, `ADMIN` | Audit log transaction history |
| **Order Service** | `/api/orders` | `/api/orders` | `POST` | Authenticated | Place order (Pessimistic lock & Stock Reservation) |
| **Order Service** | `/api/orders` | `/api/orders` | `GET` | `MANAGER`, `ADMIN` | All order fulfillment management |
| **Order Service** | `/api/orders` | `/api/orders/customer/{id}`| `GET` | Authenticated | Customer order history |
| **Order Service** | `/api/orders` | `/api/orders/{id}/status` | `PATCH` | `MANAGER`, `ADMIN` | Order status updates (`SHIPPED`, `DELIVERED`, `CANCELLED`) |

---

## 🏗️ Application Architecture & Folder Structure

```
omnistock-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── authApi.ts
│   │   ├── productApi.ts
│   │   ├── inventoryApi.ts
│   │   ├── warehouseApi.ts
│   │   └── orderApi.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navbar.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCards.tsx
│   │   │   └── InventoryCharts.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   └── ProductFormModal.tsx
│   │   ├── warehouses/
│   │   │   ├── WarehouseCard.tsx
│   │   │   └── WarehouseFormModal.tsx
│   │   ├── inventory/
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── StockUpdateModal.tsx
│   │   │   └── ReconciliationFormModal.tsx
│   │   └── orders/
│   │       ├── OrderTable.tsx
│   │       ├── OrderStatusBadge.tsx
│   │       └── OrderDetailsModal.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useInventory.ts
│   │   ├── useWarehouses.ts
│   │   ├── useOrders.ts
│   │   └── useCart.ts
│   ├── layouts/
│   │   ├── AppLayout.tsx
│   │   ├── CustomerLayout.tsx
│   │   ├── ManagerLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── customer/
│   │   │   ├── CustomerHomePage.tsx
│   │   │   ├── ProductListingPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── MyOrdersPage.tsx
│   │   ├── manager/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── WarehousesPage.tsx
│   │   │   ├── InventoryPage.tsx
│   │   │   ├── LowStockPage.tsx
│   │   │   ├── ReconciliationPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   └── OrdersPage.tsx
│   │   └── admin/
│   │       └── SystemOverviewPage.tsx
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   ├── types/
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── inventory.ts
│   │   ├── warehouse.ts
│   │   ├── order.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── jwt.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🎨 Role-Based Experiences & Routing

### 1. **CUSTOMER Experience** (`CUSTOMER` Role)
- **Home / Landing Page**: Hero banner, stock highlight, categories, featured catalog.
- **Product Listing**: Grid / Table view switch, real-time search, category filters, page navigation.
- **Product Detail**: Highlighting multi-warehouse stock availability breakdown (e.g. Hyderabad: 50, Bangalore: 30).
- **Cart & Checkout**: Persistent cart state, live stock validation, order summary, place order submission.
- **Stock Conflict Handling (Pessimistic Locking)**: Clear notification if backend returns `Insufficient stock` or stock change during checkout.
- **My Orders**: Real-time order list with status updates (`CONFIRMED`, `SHIPPED`, `DELIVERED`).

### 2. **MANAGER Experience** (`MANAGER` Role)
- **Executive Dashboard**: Key KPIs (Total Products, Total Warehouses, Total Available Stock, Reserved Stock, Low Stock Alert Count, Confirmed Orders), Recharts analytics.
- **Product Catalog Management**: View catalog.
- **Warehouse Management**: View, add, and update physical warehouses.
- **Inventory Management**: Multi-warehouse stock tracking, stock updates.
- **Low-Stock Alerts**: Real-time alerts with status indicators (🟢 Healthy, 🟡 Low Stock, 🔴 Critical, ⚫ Out of Stock).
- **Reconciliation Audit Workflow**: Form to reconcile physical stock counts against system stock with discrepancy logging.
- **Audit Transactions**: View complete ledger history (`RESTOCK`, `RESERVATION`, `CONFIRMATION`, `RELEASE`, `RECONCILIATION`).
- **Orders Fulfillment**: View and update order statuses (`SHIPPED`, `DELIVERED`).

### 3. **ADMIN Experience** (`ADMIN` Role)
- Inherits all Manager permissions.
- Full Product Catalog Management (Add, Edit, Delete products).
- Warehouse Deletion & System Overview.

---

## 🧪 Verification & Testing Plan

### Automated Build & Unit Tests
- `npm run build` — Verify zero TypeScript compilation errors.
- Component & hook validation.

### End-to-End Manual Verification (Real Gateway Integration)
1. **User Auth Flow**: Register as `CUSTOMER`, `MANAGER`, and `ADMIN`. Login, inspect JWT parsing, verify route guards.
2. **Product Catalog**: Create product as `ADMIN`, view in `CUSTOMER` product catalog with search & filter.
3. **Warehouse & Stock Management**: Create warehouse, initialize inventory count as `MANAGER`.
4. **Order Placement**: Place order as `CUSTOMER`, verify stock reservation & stock quantity reduction in backend database.
5. **Reconciliation Audit**: Perform physical stock count audit as `MANAGER`, verify transaction log entry generated in audit history.
6. **Low-Stock Alerting**: Verify low stock alerts render dynamically when quantity drops below threshold.

---

## 💬 User Feedback Required

> [!NOTE]
> All frontend components will directly invoke the live Spring Boot microservices backend running via Docker Desktop / API Gateway on `http://localhost:8080`.
