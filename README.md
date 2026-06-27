# Order Management System - Backend

The REST API server and database management layer for the Order Management System. Built using Node.js, Express, and Prisma ORM, it handles data persistence in PostgreSQL and runs a background scheduler to transition active order statuses.

## Features

- **Order Management API**: Endpoints to create orders, fetch completed orders history, and query individual order details.
- **Product Menu API**: Endpoint to filter and fetch menu items by category.
- **Request Validation**: Schema-based inputs validation using Joi middleware.
- **Background Cron Worker**: A background interval loop (`startOrderStatusCron`) that automatically updates active order statuses in PostgreSQL every 10 seconds.
- **Database ORM**: PostgreSQL connectivity and migrations managed via Prisma.

---

## Technical Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database ORM**: Prisma Client & Prisma Migrate
- **Database**: PostgreSQL
- **Input Validation**: Joi
- **Process Manager**: Nodemon (development auto-reload)

---

## API Endpoints

### Products
- `GET /products/:category` - Fetch list of menu products matching a specific category (e.g. `Burger`, `Pizza`).

### Orders
- `POST /orders/create` - Place/create a new order. Validates body details using Joi middleware.
- `GET /orders/list` - Fetch all past completed orders (status is either `Delivered` or `Cancelled`).
- `GET /orders/:id` - Fetch details (including current tracking status) of a specific order by ID.

---

## Setup & Running Guide

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)
- **PostgreSQL** database instance running locally

### Configuration & Run

1. Navigate to the `Backend` directory:
   ```bash
   cd ./Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Create a `.env` file in the root of the `Backend` directory:
   ```env
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>"
   ```
   *Replace `<db_user>`, `<db_password>`, and `<db_name>` with your PostgreSQL server credentials and target database name.*
4. Run migrations to initialize the database schema:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will start running at `http://localhost:4000`.*

---

## Project Structure

```text
Backend/
├── prisma/                  # Prisma schema and PostgreSQL migrations definitions
│   ├── migrations/          # SQL migration files
│   └── schema.prisma        # Database schema models definitions
└── src/
    ├── Config/              # Database connections and configs
    ├── Constants/           # Key-value mappings (Order states)
    ├── Controllers/         # API business logic handlers (Orders, Products)
    ├── Middlewares/         # Request parsers, error handlers, and Joi validations
    ├── Routes/              # Express endpoint routing maps
    ├── Utils/               # Helper utils and cron status workers
    └── server.js            # Main application starter
```

---

## Keep-Alive Workflows

Since the backend is deployed on Render's free tier, the web service automatically spins down after 15 minutes of inactivity. 

To keep the backend awake 24/7 and prevent the 50+ second "cold start" delay, a GitHub Actions workflow is configured in [.github/workflows/keep-alive.yml](.github/workflows/keep-alive.yml).

- **Interval**: Runs automatically every 10 minutes.
- **Endpoint**: Pings the products endpoint `<BACKEND_URL>`.
- **Manual Trigger**: Can be run manually under the **Actions** tab of your GitHub repository.

