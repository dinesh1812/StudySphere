from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)

class NLPEngine:
    _model = None
    _topic_embeddings = None

    @classmethod
    def initialize(cls):
        """Loads the SBERT model and pre-computes taxonomy embeddings. Runs at startup."""
        if cls._model is None:
            logger.info(f"Loading SentenceTransformer model: {settings.MODEL_NAME}")
            cls._model = SentenceTransformer(settings.MODEL_NAME)
            
            logger.info("Computing embeddings for predefined academic topics...")
            cls._topic_embeddings = cls._model.encode(settings.ACADEMIC_TOPICS)
            logger.info(f"Initialized {len(settings.ACADEMIC_TOPICS)} topic embeddings.")

    @classmethod
    def is_initialized(cls) -> bool:
        return cls._model is not None

    @classmethod
    def evaluate_text(cls, text: str) -> dict:
        """
        Generates embedding for input text and calculates cosine similarity
        against local academic topic embeddings.
        """
        if not cls.is_initialized():
            logger.warning("NLP Engine not initialized. Lazy loading now...")
            cls.initialize()

        # Generate embedding for the new post
        post_embedding = cls._model.encode([text])

        # Compute cosine similarity with all topics
        similarities = cosine_similarity(post_embedding, cls._topic_embeddings)[0]
        
        # Get the highest similarity score
        max_score = float(np.max(similarities))
        best_topic_idx = int(np.argmax(similarities))
        best_topic = settings.ACADEMIC_TOPICS[best_topic_idx]

        logger.info(f"Text best matches '{best_topic}' with score: {max_score:.4f}")

        # Classification based on threshold
        if max_score >= settings.SIMILARITY_THRESHOLD:
            return {
                "label": "relevant", 
                "confidence": round(max_score, 4), 
                "reason": f"semantic_match:{best_topic}"
            }
        else:
            return {
                "label": "irrelevant", 
                "confidence": round(max_score, 4), 
                "reason": "no_semantic_match_found"
            }
