import os
import time
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StudySphere Moderation Service")

# --- Configuration ---
HF_TOKEN = os.getenv("HF_TOKEN")
# Swapped to a highly available, fast binary toxicity model
MODEL_ID = "martin-ha/toxic-comment-model"
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
            results = data[0]
            
            is_toxic = False
            highest_score = 0.0
            reason = "CLEAN"

            for label_data in results:
                label_name = label_data['label'].lower()
                
                # BUG FIX: Explicitly ensure we are only flagging the "toxic" label
                if label_name == 'toxic' and label_data['score'] > 0.80:
                    is_toxic = True
                    highest_score = label_data['score']
                    reason = "Flagged for: TOXIC CONTENT"
            
            return ModerationResponse(
                isToxic=is_toxic, 
                score=round(highest_score, 4) if is_toxic else 0.0, 
                reason=reason
            )

        elif response.status_code == 503:
            print(f"Model is loading (Attempt {attempt+1}/3). Waiting...")
            time.sleep(5)
            continue
        
        else:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Hugging Face API Error: {response.text}"
            )

    raise HTTPException(status_code=503, detail="AI Model took too long to load.")

@app.get("/")
def health_check():
    return {"status": "Moderation Service is Online"}