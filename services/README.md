# EliteMarket - Microservices Architecture

## Services Overview

| Service          | Port | Responsibility                              |
|------------------|------|---------------------------------------------|
| api-gateway      | 8080 | Single entry point, proxies to all services |
| auth-service     | 8081 | Auth, user profile, wishlist                |
| product-service  | 8082 | Products, banners, reviews, search          |
| order-service    | 8083 | Orders, payments (COD/PayPal/Razorpay)      |

## Setup (Manual - without Docker)

### 1. Install dependencies for each service

```bash
cd services/api-gateway    && npm install
cd ../auth-service         && npm install
cd ../product-service      && npm install
cd ../order-service        && npm install
```

### 2. Create .env files

Copy `.env.example` to `.env` in each service folder and fill in your values.

> Important: Use the same `JWT_SECRET` across all services.

### 3. Run all services (open 4 terminals)

```bash
# Terminal 1
cd services/api-gateway && npm run dev

# Terminal 2
cd services/auth-service && npm run dev

# Terminal 3
cd services/product-service && npm run dev

# Terminal 4
cd services/order-service && npm run dev
```

### 4. Update the frontend

In `client/.env`, point to the API Gateway:
```
VITE_API_URL=http://localhost:8080
```

---

## Setup (Docker Compose)

```bash
cd services
# Copy and fill in the root .env
cp ../.env.example .env
docker-compose up --build
```

---

## Inter-Service Communication

| Caller           | Calls                  | Purpose                          |
|------------------|------------------------|----------------------------------|
| product-service  | auth-service (internal)| Verify admin role                |
| order-service    | auth-service (internal)| Fetch user for notifications     |
| order-service    | product-service (internal) | Reduce/restore stock         |
| auth-service     | product-service (internal) | Fetch wishlist product details |
| product-service  | auth-service (internal)| Remove deleted product from wishlists |

Internal routes are prefixed `/internal/` and are NOT exposed through the API Gateway.

---

## Database Strategy

Each service has its own MongoDB database:
- `ecommerce-auth` — users
- `ecommerce-products` — products, banners
- `ecommerce-orders` — orders

The order model stores product snapshots (name, price, image) at order time,
so it does NOT need to query the product database after an order is placed.
