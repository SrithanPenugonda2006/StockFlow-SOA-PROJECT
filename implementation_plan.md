# OmniStock Retail Backend Implementation Plan

The workspace is currently empty. I will build the complete, production-quality OmniStock multi-warehouse inventory control and stock reconciliation backend from scratch.

## User Review Required

> [!IMPORTANT]
> Since this is a massive multi-service project, I will build it incrementally. Please review the architecture, tech stack, and module structure below. If everything looks good, approve the plan and I will begin the execution.

## Open Questions

None at this time. The PDF provides a very comprehensive specification. I will use Java 21, Spring Boot 3.2.x, and Spring Cloud 2023.0.x for this implementation.

## Proposed Architecture & Tech Stack

- **Java Version:** Java 21
- **Spring Boot:** 3.2.x
- **Spring Cloud:** 2023.0.x
- **Build Tool:** Maven (Multi-module project)
- **Database:** PostgreSQL
- **Migration:** Flyway
- **Communication:** OpenFeign & Eureka Service Discovery
- **Security:** Spring Security + JWT
- **Observability:** Spring Boot Actuator

### Module Structure (Maven Multi-Module)

The root directory will contain a parent `pom.xml` managing dependency versions for all child modules.

#### 1. `eureka-server` (Port: 8761)
- Spring Cloud Netflix Eureka Server for service discovery.

#### 2. `api-gateway` (Port: 8080)
- Spring Cloud Gateway.
- Routes requests to specific services.
- Global CORS configuration.
- JWT Authentication Filter (validates token before routing to protected endpoints).

#### 3. `auth-service` (Port: 8081)
- **DB:** `omnistock_auth`
- Handles user registration, login, and JWT generation.
- BCrypt password hashing.
- Entities: `User` (id, username, password_hash, role)

#### 4. `product-service` (Port: 8082)
- **DB:** `omnistock_product`
- Manages product catalog.
- Entities: `Product` (id, name, description, price, sku, category, timestamps)

#### 5. `inventory-service` (Port: 8083)
- **DB:** `omnistock_inventory`
- Manages warehouses, stock per warehouse, reservations, and audit history.
- Core logic for stock reconciliation and concurrency control (@Version optimistic locking).
- Entities: `Warehouse`, `Inventory`, `InventoryTransaction`.

#### 6. `order-service` (Port: 8084)
- **DB:** `omnistock_order`
- Manages order creation.
- Interacts with `product-service` and `inventory-service` via OpenFeign.
- Handles compensating transactions (releasing reserved stock if order fails).
- Entities: `Order`, `OrderItem`.

## Proposed Execution Steps

1. **Parent Project Setup:** Create root `pom.xml` and standard directory layout.
2. **Infrastructure Services:** Implement `eureka-server` and `api-gateway`.
3. **Core Services:** Implement `auth-service` and `product-service` with their respective databases, flyway migrations, and basic CRUD/security.
4. **Inventory Service:** Implement `inventory-service` focusing heavily on concurrent stock updates, locking, reservations, reconciliation, and audit logs.
5. **Order Service:** Implement `order-service` incorporating the end-to-end order placement workflow, interacting via OpenFeign to coordinate stock reservations.
6. **Docker & Postman:** Add `docker-compose.yml` to spin up PostgreSQL databases and services, `.env.example`, and an exported Postman collection.
7. **Testing & Validation:** Write Unit and Integration tests for all critical flows, especially concurrency and stock calculations. Run all tests to ensure definition of done is met.

## Verification Plan

### Automated Tests
- JUnit 5 / Mockito unit tests for service layers.
- `@SpringBootTest` and `MockMvc` integration tests using Testcontainers or H2 for database flows.
- Concurrency tests to ensure pessimistic/optimistic locking prevents overselling.

### Manual Verification
- Execute `mvn clean install` across the entire project.
- Spin up `docker-compose up -d` for databases.
- Start all 6 Spring Boot applications.
- Run the provided Postman collection to perform an end-to-end flow: User registration -> Login -> Create Product -> Create Warehouse -> Add Stock -> Place Order -> Verify Stock Decrement.
