# StockFlow — Multi-Warehouse Inventory Control & Stock Reconciliation System

StockFlow (OmniStock) is an enterprise-grade, microservice-based inventory management, multi-warehouse control, and stock reconciliation platform designed to streamline multi-location stock movements, order processing, and administrative controls.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [System Architecture](#system-architecture)
- [Microservices Architecture](#microservices-architecture)
- [Technology Stack](#technology-stack)
  - [Backend Stack](#backend-technology-stack)
  - [Frontend Stack](#frontend-technology-stack)
- [Authentication & RBAC](#authentication--rbac)
- [Database & Migrations](#database--migrations)
- [Service Discovery & API Gateway](#service-discovery--api-gateway)
- [Main Features](#main-features)
- [Project Structure](#project-structure)
- [Service Ports](#service-ports)
- [How to Run](#how-to-run)
  - [Prerequisites](#prerequisites)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Running Microservices Locally (Maven)](#running-microservices-locally-maven)
  - [Running the Frontend](#running-the-frontend)

---

## Project Overview
StockFlow provides real-time visibility into inventory across multiple distribution centers and retail warehouses. It features real-time stock allocation during order placement, threshold notifications for low stock, automated inventory reconciliation workflows, and robust Role-Based Access Control (RBAC) for system administrators and warehouse managers.

## Problem Statement
Traditional centralized inventory systems suffer from latency, single points of failure, inconsistent stock levels across warehouses, lack of audit trails for manual adjustments, and insecure access controls. StockFlow addresses these challenges through a resilient, decoupled microservice architecture paired with an intuitive modern frontend interface.

## Objectives
- **Scalability**: Decouple domain capabilities into dedicated microservices (Auth, Catalog, Inventory, Orders).
- **Reliability & Auditability**: Maintain precise multi-warehouse stock balances with transaction history and reconciliation logs.
- **Security**: Implement JWT-based statutory authorization with enforced password strength rules and RBAC controls (`ROLE_ADMIN`, `ROLE_MANAGER`).
- **Developer & Operational Efficiency**: Containerized deployment via Docker Compose alongside Eureka Service Discovery and Spring Cloud API Gateway.

---

## System Architecture

```
                                +-------------------+
                                |  React Frontend   |
                                |   (Port 5173)     |
                                +---------+---------+
                                          |
                                          v
                                +-------------------+
                                |    API Gateway    |
                                |   (Port 8080)     |
                                +----+----+----+----+
                                     |    |    |
           +-------------------------+    |    +-------------------------+
           |                              |                              |
           v                              v                              v
+--------------------+         +--------------------+         +--------------------+
|    Auth Service    |         |  Product Service   |         | Inventory Service  |
|    (Port 8081)     |         |    (Port 8082)     |         |    (Port 8083)     |
+--------------------+         +--------------------+         +--------------------+
           |                              |                              |
           +-------------------------+    |    +-------------------------+
                                     v    v    v
                                +-------------------+
                                |   Order Service   |
                                |    (Port 8084)    |
                                +-------------------+
                                          ^
                                          |
                                +-------------------+
                                |   Eureka Server   |
                                |    (Port 8761)    |
                                +-------------------+
```

---

## Microservices Architecture

1. **Eureka Discovery Server** (`eureka-server`): Service registry for elastic service discovery.
2. **API Gateway** (`api-gateway`): Single entry point for routing, CORS handling, and centralized JWT validation.
3. **Authentication Service** (`auth-service`): Handles identity management, user registration, JWT generation, password resets via SMTP, session management, and manager provisioning by Admins.
4. **Product Catalog Service** (`product-service`): Manages master product catalog, categories, pricing, SKU mappings, and product details.
5. **Inventory Service** (`inventory-service`): Tracks multi-warehouse stock balances, handles physical stock reconciliations, low-stock threshold monitoring, and warehouse transfers.
6. **Order Service** (`order-service`): Processes sales orders, reserves/deducts stock dynamically across warehouses, and tracks order fulfillment states.

---

## Technology Stack

### Backend Technology Stack
- **Language & Framework**: Java 17, Spring Boot 3.x
- **Spring Cloud**: Spring Cloud Gateway, Netflix Eureka Server
- **Security**: Spring Security 6, JWT (JSON Web Tokens)
- **Data Access**: Spring Data JPA / Hibernate
- **Database**: H2 (In-Memory for Dev), PostgreSQL (Production/Docker)
- **Email**: Spring Mail / SMTP integration
- **Build Tool**: Apache Maven (Multi-module parent POM)
- **Containerization**: Docker & Docker Compose

### Frontend Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **State & HTTP**: Axios, React Router v6
- **Testing**: Vitest & React Testing Library

---

## Authentication & RBAC

StockFlow uses standard JWT tokens passed in HTTP Authorization headers (`Bearer <token>`).

### Supported Roles:
- **`ROLE_ADMIN`**: Full platform access. Can create/manage warehouse managers, trigger system password resets, and view global audit logs and metrics.
- **`ROLE_MANAGER`**: Warehouse-level operational access. Can view products, execute stock adjustments/reconciliations, receive low stock alerts, and create/manage orders.

---

## Service Ports

| Service | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8080` | Unified API entry point (`/api/**`) |
| **Auth Service** | `8081` | Authentication & User Management |
| **Product Service** | `8082` | Product Catalog & Categories |
| **Inventory Service** | `8083` | Warehouse Stock & Reconciliations |
| **Order Service** | `8084` | Order Processing & Stock Deduction |
| **Eureka Server** | `8761` | Microservice Registry Dashboard |
| **React Frontend** | `5173` | Web UI Dashboard |

---

## Project Structure

```
SOA-PROJECT/
├── BACKEND/
│   ├── pom.xml                   # Parent Maven POM
│   ├── docker-compose.yml        # Multi-service container Orchestration
│   ├── .env.example              # Environment variables template
│   ├── eureka-server/            # Discovery Server (Port 8761)
│   ├── api-gateway/              # Cloud Gateway & Routing (Port 8080)
│   ├── auth-service/             # Authentication & User Management (Port 8081)
│   ├── product-service/          # Product Catalog (Port 8082)
│   ├── inventory-service/        # Multi-warehouse Inventory (Port 8083)
│   └── order-service/            # Order Processing (Port 8084)
│
├── FRONTEND/
│   ├── src/                      # React components, pages, utils, & API layers
│   ├── public/                   # Static web assets
│   ├── package.json              # Node dependencies and scripts
│   ├── vite.config.ts            # Vite configuration
│   └── .env.example              # Frontend environment template
│
├── implementation_plan.md        # Technical execution plan 1
├── implementation_plan_1.md      # Technical execution plan 2
├── OmniStock_PRD.pdf             # System PRD Specification
├── OmniStock_Frontend_PRD.pdf    # Frontend UI/UX PRD Specification
├── .gitignore                    # System-wide Git ignore rules
└── README.md                     # Project documentation
```

---

## How to Run

### Prerequisites
- Java 17+ JDK installed
- Apache Maven 3.8+
- Node.js (v18+) & npm
- Docker & Docker Compose (Optional, for containerized run)

### Running with Docker Compose
To launch the entire backend environment (PostgreSQL databases, Eureka Server, Gateway, and Services):

```bash
cd BACKEND
docker-compose up --build
```

### Running Microservices Locally (Maven)
You can start the backend services individually from the `BACKEND` directory:

1. **Start Service Discovery**:
   ```bash
   cd BACKEND/eureka-server
   mvn spring-boot:run
   ```
2. **Start API Gateway**:
   ```bash
   cd BACKEND/api-gateway
   mvn spring-boot:run
   ```
3. **Start Core Services** (`auth-service`, `product-service`, `inventory-service`, `order-service`):
   ```bash
   cd BACKEND/<service-folder>
   mvn spring-boot:run
   ```

### Running the Frontend
1. Navigate to the `FRONTEND` directory:
   ```bash
   cd FRONTEND
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the frontend dashboard at `http://localhost:5173`.
