from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from models.schemas import (
    ModerationRequest,
    ModerationResponse,
    FeedbackRequest,
    FeedbackResponse,
    HealthResponse
)
from models.db import get_db
from services.rules_engine import RulesEngine
from services.nlp_engine import NLPEngine
from services.feedback_service import FeedbackService
from core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check() -> Any:
    return {
        "status": "ok",
        "model_loaded": NLPEngine.is_initialized()
    }

@router.post("/moderate", response_model=ModerationResponse)
def moderate_post(request: ModerationRequest) -> Any:
    logger.info(f"Received moderation request for postId: {request.postId}")
    
    # Step 1: Basic rule filtering
    rule_rejection = RulesEngine.evaluate(request.text)
    if rule_rejection:
        logger.info(f"Post {request.postId} rejected by RulesEngine: {rule_rejection['reason']}")
        return rule_rejection
        
    # Step 2: Semantic similarity scoring
    nlp_result = NLPEngine.evaluate_text(request.text)
    logger.info(f"Post {request.postId} NLP result: {nlp_result['label']} (score: {nlp_result['confidence']})")
    
    return nlp_result

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)) -> Any:
    logger.info(f"Received feedback for postId: {request.postId}, vote: {request.vote}")
    try:
        FeedbackService.save_feedback(db, request)
        return {"status": "success", "message": "Feedback recorded for future model refinement"}
    except Exception as e:
        logger.error(f"Failed to record feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")
