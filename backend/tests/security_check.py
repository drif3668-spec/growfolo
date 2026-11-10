import os
import sys

os.environ["DATABASE_URL"] = "sqlite:///./_security_check.db"
os.environ["APP_ENV"] = "development"
os.environ["JWT_SECRET"] = "test-only-secret"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)

checks = []

def check(name, resp, expected):
    ok = resp.status_code == expected
    checks.append((ok, name, resp.status_code, expected))
    return resp

# Public reads must still work
check("GET /products (public)", client.get("/api/v1/products"), 200)
check("GET /blog (public)", client.get("/api/v1/blog"), 200)

# Admin surfaces must be closed
check("GET /products/all (admin)", client.get("/api/v1/products/all"), 401)
check("POST /products (admin)", client.post("/api/v1/products", json={"name": "x", "slug": "x", "price": 1}), 401)
check("GET /store-orders (admin)", client.get("/api/v1/store-orders"), 401)
check("GET /banners/admin/all (admin)", client.get("/api/v1/banners/admin/all"), 401)
check("GET /blog/admin/all (admin)", client.get("/api/v1/blog/admin/all"), 401)
check("GET /discounts (admin)", client.get("/api/v1/discounts"), 401)
check("PATCH order status (admin)", client.patch("/api/v1/store-orders/abc/status", json={"status": "activated"}), 401)
check("PATCH tracking (admin)", client.patch("/api/v1/store-orders/abc/tracking", json={"tracking_stage": 2}), 401)

# OTP bypass must be closed
r = client.post("/api/v1/auth/verify-otp", json={"email": "admin@growfolo.io", "otp": "000000"})
check("POST /auth/verify-otp cannot mint a token for a verified email", r, 400)

# Price cannot be supplied by the client
r = client.post(
    "/api/v1/store-orders",
    json={
        "customer_name": "Test Buyer",
        "customer_email": "buyer@example.com",
        "product_id": "claude-opus-48-lifetime",
        "product_price": 0.01,
        "product_name": "Fake",
        "payment_method": "usdt",
    },
)
check("POST /store-orders ignores client price (201)", r, 201)
if r.status_code == 201:
    body = r.json()
    from app.db.session import SessionLocal  # local import, test only
    from app.models.order import Order

    db = SessionLocal()
    stored = db.get(Order, body["id"])
    price_ok = (
        float(body["product_price"]) == 150.0
        and stored is not None
        and float(stored.total) == 150.0
    )
    db.close()
    checks.append((price_ok, "server price + total = catalogue price (150)", body["product_price"], 150.0))

    r2 = client.post(
        "/api/v1/store-orders",
        json={
            "customer_name": "Test Buyer",
            "customer_email": "buyer@example.com",
            "product_id": "does-not-exist",
            "payment_method": "usdt",
        },
    )
    check("POST /store-orders rejects unknown product", r2, 404)

print()
failed = 0
for ok, name, got, exp in checks:
    print(("PASS " if ok else "FAIL ") + f"{name} (got {got}, expected {exp})")
    if not ok:
        failed += 1
print(f"\n{len(checks) - failed}/{len(checks)} passed")
