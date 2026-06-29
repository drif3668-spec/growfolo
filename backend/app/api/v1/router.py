from fastapi import APIRouter

from app.api.v1.routes import auth, banners, chat, checkout, orders, products, store_orders, uploads

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["checkout"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(store_orders.router, prefix="/store-orders", tags=["store-orders"])
api_router.include_router(banners.router, prefix="/banners", tags=["banners"])

