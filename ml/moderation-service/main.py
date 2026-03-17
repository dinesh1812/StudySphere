from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from core.config import settings
from services.nlp_engine import NLPEngine
from contextlib import asynccontextmanager

import logging

logger = logging.getLogger("moderation-service")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model and initialize embeddings
    logger.info("Initializing NLP Engine...")
    NLPEngine.initialize()
    logger.info("NLP Engine initialized successfully.")
    yield
    # Cleanup if needed
    logger.info("Shutting down NLP Moderation Service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "StudySphere NLP Moderation Service is running"}
