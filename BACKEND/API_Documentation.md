# OmniStock Backend - API Reference Documentation

**PS017: Multi-Warehouse Inventory Control & Stock Reconciliation System**

---

## 📍 System Architecture & Base URL

All requests pass through the central **API Gateway**:
- **Base URL**: `http://localhost:8080`
- **Eureka Registry**: `http://localhost:8761`

```
  Client (Postman / Frontend) 
              │
              ▼
    ┌──────────────────┐
    │   API Gateway    │ (Port 8080)
    └─────────┬────────┘
              │ (JWT Auth & Eureka Load Balancing)
    ┌─────────┴─────────────────────────────────────────┐
    │          │               │                │       │
    ▼          ▼               ▼                ▼       ▼
┌───────┐ ┌─────────┐ ┌─────────────────┐ ┌───────────┐ ┌────────┐
│ Auth  │ │ Product │ │    Inventory    │ │   Order   │ │ Eureka │
│:8081  │ │  :8082  │ │      :8083      │ │   :8084   │ │ :8761  │
└───────┘ └─────────┘ └─────────────────┘ └───────────┘ └────────┘
```

---

## 🔑 Authentication & Headers

Protected endpoints require a **Bearer JWT Token** obtained from the Login API:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json
```

---

## 1. Authentication Service (`/api/auth`)

### 1.1 Register User
Register a new user with a specific role (`ADMIN`, `MANAGER`, or `CUSTOMER`).

- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "ADMIN"
}
```

#### Response (`201 Created`)
```text
User registered successfully
```

---

### 1.2 Login (Get JWT Token)
Authenticate credentials and obtain a signed JWT token.

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Response (`200 OK`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJhZG1pbiIsImlhdCI6MTc4ODUwMTg0OSwiZXhwIjoxNzg4NTg4MjQ5fQ.1eFNlPzeCIaSNM0LJOmN1fbV8ipNTlboJ6NkS-u9Vuk"
}
```

---

## 2. Product Service (`/api/products`)

### 2.1 Create Product
Add a new product to the catalog. Requires `ADMIN` role.

- **Method**: `POST`
- **Endpoint**: `/api/products`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "name": "Wireless Gaming Mouse",
  "description": "Ergonomic 16K DPI wireless mouse",
  "sku": "GM-9000",
  "price": 59.99,
  "category": "Electronics"
}
```

#### Response (`201 Created`)
```json
{
  "id": 1,
  "name": "Wireless Gaming Mouse",
  "description": "Ergonomic 16K DPI wireless mouse",
  "sku": "GM-9000",
  "price": 59.99,
  "category": "Electronics",
  "createdAt": "2026-09-04T06:10:38.978007",
  "updatedAt": "2026-09-04T06:10:38.978044"
}
```

---

### 2.2 Get All Products (Paginated)
Fetch paginated catalog items with optional filtering by name or category.

- **Method**: `GET`
- **Endpoint**: `/api/products?page=0&size=10&name=Mouse&category=Electronics`
- **Headers**: Public

#### Response (`200 OK`)
```json
{
  "content": [
    {
      "id": 1,
      "name": "Wireless Gaming Mouse",
      "sku": "GM-9000",
      "price": 59.99,
      "category": "Electronics"
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 10 },
  "totalElements": 1
}
```

---

### 2.3 Get Product by ID
- **Method**: `GET`
- **Endpoint**: `/api/products/{id}`

---

### 2.4 Get Product by SKU
- **Method**: `GET`
- **Endpoint**: `/api/products/sku/{sku}`

---

### 2.5 Update Product
- **Method**: `PUT`
- **Endpoint**: `/api/products/{id}`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 2.6 Delete Product
- **Method**: `DELETE`
- **Endpoint**: `/api/products/{id}`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

## 3. Inventory Service (`/api/inventory`)

### 3.1 Create Warehouse
Register a physical warehouse facility.

- **Method**: `POST`
- **Endpoint**: `/api/inventory/warehouses`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "name": "Hyderabad Central Fulfillment Center",
  "location": "HITEC City, Hyderabad",
  "capacity": 100000
}
```

#### Response (`201 Created`)
```json
{
  "id": 1,
  "name": "Hyderabad Central Fulfillment Center",
  "location": "HITEC City, Hyderabad"
}
```

---

### 3.2 Add Stock / Initialize Product Inventory
Set up or increase stock for a product in a warehouse.

- **Method**: `POST`
- **Endpoint**: `/api/inventory`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "productId": 1,
  "warehouseId": 1,
  "quantity": 100
}
```

#### Response (`201 Created`)
```json
{
  "id": 1,
  "productId": 1,
  "warehouseId": 1,
  "quantity": 100,
  "reservedQuantity": 0,
  "availableQuantity": 100,
  "version": 0
}
```

---

### 3.3 Get Inventory by Product ID
- **Method**: `GET`
- **Endpoint**: `/api/inventory/product/{productId}`

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "productId": 1,
    "warehouseId": 1,
    "quantity": 100,
    "reservedQuantity": 0,
    "availableQuantity": 100,
    "version": 0
  }
]
```

---

### 3.4 Get Low Stock Warnings
- **Method**: `GET`
- **Endpoint**: `/api/inventory/low-stock`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 3.5 Reconcile Inventory (Audit Adjustment)
Perform a physical stock audit adjustment with discrepancy auditing.

- **Method**: `POST`
- **Endpoint**: `/api/inventory/reconcile`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "productId": 1,
  "warehouseId": 1,
  "actualQuantity": 95,
  "reason": "Monthly Audit Discrepancy",
  "performedBy": "auditor_admin"
}
```

---

## 4. Order Service (`/api/orders`)

### 4.1 Place New Order (Triggers Distributed Saga & Pessimistic Lock)
Place an order. Automatically validates product price via Product Service, locks and reserves inventory in Inventory Service, and confirms the transaction.

- **Method**: `POST`
- **Endpoint**: `/api/orders`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "customerId": "john_doe",
  "idempotencyKey": "IDEM-KEY-20260904-001",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

#### Response (`201 Created`)
```json
{
  "id": 1,
  "customerId": "john_doe",
  "status": "CONFIRMED",
  "totalAmount": 119.98,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 59.99
    }
  ],
  "createdAt": "2026-09-04T06:15:34.346879",
  "updatedAt": "2026-09-04T06:15:34.346912"
}
```

---

### 4.2 Get Order by ID
- **Method**: `GET`
- **Endpoint**: `/api/orders/{id}`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 4.3 Get Orders by Customer
- **Method**: `GET`
- **Endpoint**: `/api/orders/customer/{customerId}`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 4.4 Update Order Status
- **Method**: `PATCH`
- **Endpoint**: `/api/orders/{id}/status`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

#### Request Body
```json
{
  "status": "SHIPPED"
}
```

#### Response (`200 OK`)
```json
{
  "id": 1,
  "status": "SHIPPED",
  "totalAmount": 119.98
}
```
