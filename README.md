# Growfolo.io

Growfolo is a digital-product storefront with a Next.js 15 frontend and a FastAPI backend.  
It ships with orders, checkout, blog, admin panel, live chat, discount codes, and more.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Three.js |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2 |
| Database (dev) | SQLite — created automatically, zero setup |
| Database (prod) | PostgreSQL — Neon recommended |
| Hosting | Vercel (frontend + FastAPI serverless) |

---

## Project Structure

```
growfolo/
├── frontend/          Next.js storefront + admin panel
├── backend/           FastAPI service
│   ├── app/
│   │   ├── api/       Route handlers
│   │   ├── models/    SQLAlchemy ORM models
│   │   ├── core/      Config, security
│   │   └── db/        Engine + session
│   └── requirements.local.txt
├── api/
│   ├── index.py       Vercel serverless entry point
│   └── requirements.txt
└── vercel.json        Vercel single-project config
```

---

## Local Development

### 1. Clone and configure

```bash
git clone https://github.com/drif3668-spec/growfolo.git
cd growfolo
```

Create a backend `.env` (SQLite — no database setup needed):

```bash
cd backend
cp ../.env.example .env
# Edit .env — the defaults work for local development
```

Create a frontend `.env.local`:

```bash
cd ../frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000  (already set)
```

### 2. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.local.txt
uvicorn main:app --reload --port 8000
```

The first run:
- Creates `backend/growfolo.db` automatically
- Seeds the admin user (`admin@growfolo.io` / `Admin@2026`)
- Seeds 5 sample blog posts

API docs: http://localhost:8000/docs

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev          # port 3000
# npm run dev:growfolo  # port 3001 (if 3000 is occupied)
```

Storefront: http://localhost:3000  
Admin panel: http://localhost:3000/admin

---

## Production Deployment on Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "deploy"
git push origin main
```

### Step 2 — Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `growfolo`
3. Set **Root Directory** to `./`
4. Use **Framework Preset**: `Next.js`
5. Click **Deploy** after adding the environment variables below

### Step 3 — Set environment variables

Go to **Vercel Dashboard → Project → Settings → Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `APP_ENV` | `production` | Enables production guards |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Your Neon connection string |
| `JWT_SECRET` | *(random 64-char hex)* | `openssl rand -hex 32` |
| `FRONTEND_URL` | `https://your-project.vercel.app` | Your Vercel domain |
| `RESEND_API_KEY` | `re_...` | From resend.com (optional) |
| `EMAIL_FROM` | `Growfolo <orders@growfolo.io>` | Sender name |

> **Neon database URL** — get it from [neon.tech](https://neon.tech):  
> Project → Connection Details → copy the **psycopg2** connection string.

### Step 4 — Redeploy

After saving environment variables, trigger a new deployment:

```
Vercel Dashboard → Deployments → ⋯ → Redeploy
```

Or push any commit to trigger an automatic redeploy.

---

## Database Notes

### Development

SQLite file lives at `backend/growfolo.db`.  
Delete it to reset all data (tables are recreated on next start).

### Production (Neon PostgreSQL)

- All tables are created automatically with `CREATE TABLE IF NOT EXISTS` on startup
- Admin user is seeded once if `admin@growfolo.io` does not exist
- Blog posts are seeded once if the `blog_posts` table is empty

**SQLite is blocked in production.**  
If `APP_ENV=production` and `DATABASE_URL` starts with `sqlite://`, the backend exits immediately with a clear error message.

### Connection limits (Neon free tier)

The SQLAlchemy engine is configured with `pool_size=5, max_overflow=0` to stay within Neon's 10-connection free-tier limit.  
Upgrade to a paid Neon plan or use Neon's built-in connection pooler URL for higher traffic.

---

## Testing After Deployment

### 1. Health check

```bash
curl https://your-project.vercel.app/api/v1/../health
# → {"status":"ok"}
```

### 2. Register a user

```bash
curl -X POST https://your-project.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test@1234","full_name":"Test User"}'
# → {"access_token":"eyJ..."}
```

### 3. Login

```bash
curl -X POST https://your-project.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
# → {"access_token":"eyJ..."}
```

### 4. Verify data in Neon

Open [console.neon.tech](https://console.neon.tech) → your project → **Tables**.  
You should see rows in `users` after registration.

### 5. Admin panel

Login at `/admin` with `admin@growfolo.io` / `Admin@2026`.  
Orders, users, and blog posts saved here are all persisted in Neon PostgreSQL.

---

## API Reference

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/products
POST   /api/v1/store-orders
GET    /api/v1/store-orders/track/{order_id}
GET    /api/v1/blog
GET    /api/v1/blog/{slug}
GET    /api/v1/discounts/validate/{code}
POST   /api/v1/chat/session
POST   /api/v1/chat/message
GET    /health
```

Full interactive docs (local): http://localhost:8000/docs
