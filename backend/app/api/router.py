from fastapi import APIRouter
from app.api.spaces import router as spaces_router

api_router = APIRouter()

# Include Feature Routers
api_router.include_router(spaces_router)
