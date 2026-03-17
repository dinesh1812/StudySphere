from sqlalchemy.orm import Session
from models.db import FeedbackLog
from models.schemas import FeedbackRequest

class FeedbackService:
    @staticmethod
    def save_feedback(db: Session, feedback_req: FeedbackRequest) -> FeedbackLog:
        db_log = FeedbackLog(
            post_id=feedback_req.postId,
            vote=feedback_req.vote,
            feedback=feedback_req.feedback
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
