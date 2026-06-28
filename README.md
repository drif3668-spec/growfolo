# Growfolo.io

Professional scalable store starter for Growfolo.io.

## Stack

- Frontend: Next.js, TypeScript, TailwindCSS, Framer Motion, Three.js
- Backend: Python FastAPI
- Database: PostgreSQL
- Email: Resend
- Containers: Docker Compose

## Project Structure

```text
growfolo/
  frontend/          Next.js storefront and admin panel
  backend/           FastAPI API service
  infra/             Database bootstrap and infrastructure files
  docker-compose.yml Local development stack
  .env.example       Shared environment reference
```

## Quick Start

1. Copy environment files:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

2. Start the full stack:

```bash
docker compose up --build
```

3. Open:

- Storefront: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Core Domains

- Authentication and admin access
- Products catalog
- Orders
- Checkout
- Payment proof uploads
- Resend transactional emails

