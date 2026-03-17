import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StudySphere NLP Moderation Service"
    VERSION: str = "1.0.0"
    
    # NLP Settings
    MODEL_NAME: str = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.35"))
    
    # Predefined Academic Topics for the Taxonomy
    ACADEMIC_TOPICS: list[str] = [
        "Data Structures and Algorithms",
        "Operating Systems",
        "Database Management Systems",
        "Machine Learning and Artificial Intelligence",
        "Computer Networks",
        "Software Engineering",
        "Physics and Mechanics",
        "Mathematics and Calculus",
        "Chemistry",
        "Biology and Life Sciences",
        "History and Humanities",
        "Economics and Finance",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering"
    ]
    
    # Database for local feedback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./feedback.db")

settings = Settings()
