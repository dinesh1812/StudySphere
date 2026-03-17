from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ModerationRequest(BaseModel):
    postId: str = Field(..., description="Unique ID of the post")
    text: str = Field(..., min_length=1, description="Text content (title + body) to be moderated")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional metadata like author or tags")

class ModerationResponse(BaseModel):
    label: str = Field(..., description="'relevant', 'irrelevant', or 'rejected'")
    confidence: float = Field(..., description="Similarity confidence score (0 to 1)")
    reason: str = Field(..., description="Reason for the label (e.g., 'semantic_match', 'rule_violation')")

class FeedbackRequest(BaseModel):
    postId: str = Field(..., description="Unique ID of the post")
    vote: str = Field(..., description="'upvote' or 'downvote'")
    feedback: Optional[str] = Field(None, description="Optional textual feedback context")

class FeedbackResponse(BaseModel):
    status: str
    message: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
