# StudySphere NLP Moderation Service

This microservice provides real-time content moderation for the StudySphere platform using a hybrid approach of rule-based filtering and semantic similarity scoring using Sentence-BERT.

## Architecture & Federated Principles
- **Privacy First:** Raw data is not shared centrally. It runs isolated within each institution's node.
- **Hybrid Moderation:** 
  1. *Rules Engine:* Catches obvious spam, short content, excessive URLs, and abusive keywords.
  2. *NLP Engine:* Catches inherently off-topic posts using semantic embeddings (SBERT: `all-MiniLM-L6-v2`).
- **Feedback Loop:** Local feedback (upvotes/downvotes) is stored locally (`feedback.db`). These logs act as the local dataset for future Local Fine-tuning / Federated Learning pipelines, without exposing student data to central servers.

## Setup and Run Instructions

### Using Docker (Recommended)
```bash
# Build the container (downloads the model during build)
docker build -t studysphere-moderation .

# Run the container
docker run -p 8000:8000 studysphere-moderation
```

### Local Development Setup
```bash
# 1. Create virtual environment
python -m venv venv
# Windows: venv\\Scripts\\activate | Mac/Linux: source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Note: The first time you run this locally, it will download the ~80MB `all-MiniLM-L6-v2` SBERT model into your huggingface cache.

## API Usage Examples

### 1. Health Status
Check if the SBERT model is fully loaded in memory.
```bash
curl -X GET http://localhost:8000/health
```

### 2. Moderate Academic Content (Relevant)
```bash
curl -X POST http://localhost:8000/moderate \\
  -H "Content-Type: application/json" \\
  -d '{"postId": "1", "text": "Can someone explain the difference between processes and threads in an OS?"}'
```

### 3. Moderate Non-Academic Content (Irrelevant)
```bash
curl -X POST http://localhost:8000/moderate \\
  -H "Content-Type: application/json" \\
  -d '{"postId": "2", "text": "Does anyone want to go to the movies tonight?"}'
```

### 4. Provide Feedback for Improvements
```bash
curl -X POST http://localhost:8000/feedback \\
  -H "Content-Type: application/json" \\
  -d '{"postId": "1", "vote": "upvote", "feedback": "Great academic response"}'
```
