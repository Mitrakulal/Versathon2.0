from fastapi import APIRouter
from app.api.spaces import router as spaces_router
from app.api.documents import router as documents_router
from app.api.topics import router as topics_router
from app.api.questions import router as questions_router

api_router = APIRouter()

# Include Feature Routers
api_router.include_router(spaces_router)
api_router.include_router(documents_router)
api_router.include_router(topics_router)
api_router.include_router(questions_router)
