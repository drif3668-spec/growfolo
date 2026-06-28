# Growfolo.io

Growfolo is a local-development ecommerce starter for digital products, subscriptions, orders, checkout, payment proof uploads, admin workflows, and Resend email integration.

## Stack

- Frontend: Next.js, TypeScript, TailwindCSS, Framer Motion, Three.js
- Backend: Python FastAPI
- Local database: SQLite
- Production-ready path later: PostgreSQL

This setup runs directly on your machine with normal frontend and backend commands.

## Project Structure

```text
growfolo/
  frontend/          Next.js storefront and admin panel
  backend/           FastAPI API service
  backend/growfolo.db Local SQLite database created automatically
  .env.example       Shared environment reference
```

## Environment

Root example:

```bash
cp .env.example .env
```

Frontend example:

```bash
cd frontend
cp .env.example .env.local
```

Backend example:

```bash
cd backend
cp .env.example .env
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

If another project already uses port `3000`, run Growfolo on a dedicated port:

```bash
cd frontend
npm install
npm run dev:growfolo
```

Open:

```text
http://localhost:3001
```

## Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open:

```text
http://localhost:8000/docs
```

If another project already uses port `8000`, run Growfolo API on:

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

Open:

```text
http://localhost:8001/docs
```

## Database

The backend uses SQLite by default:

```text
backend/growfolo.db
```

The database tables are created automatically when FastAPI starts.

Default backend database URL:

```text
sqlite:///./growfolo.db
```

## Local API

- `GET /api/v1/products`
- `GET /api/v1/products/{product_id}`
- `POST /api/v1/products`
- `GET /api/v1/orders`
- `GET /api/v1/orders/{order_id}`
- `POST /api/v1/orders`
- `POST /api/v1/checkout`
- `POST /api/v1/uploads/payment-proof/{order_id}`

## Production Note

For official deployment, switch `DATABASE_URL` from SQLite to PostgreSQL and add migrations before launch.
