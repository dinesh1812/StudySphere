from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# 1. Load the AI Model (This will download ~400MB the very first time you run it)
print("Loading AI Model... Please wait.")
classifier = pipeline("text-classification", model="unitary/toxic-bert", top_k=None)
print("AI Model Loaded Successfully!")

# 2. Define the Request and Response DTOs
class ModerationRequest(BaseModel):
    text: str

class ModerationResponse(BaseModel):
    isToxic: bool
    score: float
    reason: str

# 3. The API Endpoint
@app.post("/api/moderate", response_model=ModerationResponse)
def moderate_text(request: ModerationRequest):
    # Run the AI on the incoming text
    results = classifier(request.text)[0]
    
    is_toxic = False
    highest_score = 0.0
    reason = "CLEAN"

    # 'results' contains scores for toxic, severe_toxic, obscene, threat, insult, identity_hate
    for label_data in results:
        # If the AI is more than 80% sure this is toxic/threatening
        if label_data['score'] > 0.80:
            is_toxic = True
            highest_score = max(highest_score, label_data['score'])
            reason = f"Flagged for: {label_data['label'].upper()}"
            break
            
    return ModerationResponse(isToxic=is_toxic, score=highest_score, reason=reason)