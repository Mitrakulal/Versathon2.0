from fastapi import APIRouter
from app.api.spaces import router as spaces_router
from app.api.documents import router as documents_router
from app.api.topics import router as topics_router
from app.api.questions import router as questions_router
from app.api.quizzes import router as quizzes_router
from app.api.flashcards import router as flashcards_router
from app.api.mastery import router as mastery_router

api_router = APIRouter()

# Include Feature Routers
api_router.include_router(spaces_router)
api_router.include_router(documents_router)
api_router.include_router(topics_router)
api_router.include_router(questions_router)
api_router.include_router(quizzes_router)
api_router.include_router(flashcards_router)
api_router.include_router(mastery_router)
