import os
import time
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file for local development (Render will use Dashboard Env Vars)
load_dotenv()

app = FastAPI(title="StudySphere Moderation Service")

# --- Configuration ---
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "unitary/toxic-bert"
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"

# --- Data Models ---
class ModerationRequest(BaseModel):
    text: str

class ModerationResponse(BaseModel):
    isToxic: bool
    score: float
    reason: str

# --- Logic ---
@app.post("/api/moderate", response_model=ModerationResponse)
def moderate_text(request: ModerationRequest):
    if not HF_TOKEN:
        raise HTTPException(status_code=500, detail="HF_TOKEN not configured on server.")

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": request.text}
    
    # Retry logic for "Model Loading" (503 error)
    for attempt in range(3):
        response = requests.post(API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            # Hugging Face returns a list of lists: [[{'label': 'toxic', 'score': 0.9}, ...]]
            results = data[0]
            
            is_toxic = False
            highest_score = 0.0
            reason = "CLEAN"

            for label_data in results:
                # If any toxic category is above 80% confidence
                if label_data['score'] > 0.80:
                    is_toxic = True
                    # Keep track of the highest toxicity score found
                    if label_data['score'] > highest_score:
                        highest_score = label_data['score']
                        reason = f"Flagged for: {label_data['label'].upper()}"
            
            return ModerationResponse(
                isToxic=is_toxic, 
                score=round(highest_score, 4), 
                reason=reason
            )

        elif response.status_code == 503:
            # Model is loading, wait 5 seconds and try again
            print(f"Model is loading (Attempt {attempt+1}/3). Waiting...")
            time.sleep(5)
            continue
        
        else:
            # Other errors (401, 404, 500)
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Hugging Face API Error: {response.text}"
            )

    raise HTTPException(status_code=503, detail="AI Model took too long to load. Please try again.")

@app.get("/")
def health_check():
    return {"status": "Moderation Service is Online"}