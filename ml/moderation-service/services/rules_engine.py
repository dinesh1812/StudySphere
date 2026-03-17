import re

class RulesEngine:
    # basic spam or banned terms
    BANNED_WORDS = {"spam", "buy now", "click here", "free money", "viagra", "casino", "bitcoin proxy"}

    @classmethod
    def evaluate(cls, text: str) -> dict | None:
        """
        Runs basic rule-based checks before heavy NLP inference.
        Returns a rejection reason if it fails, else None.
        """
        # 1. Empty Content Checking
        if not text or len(text.strip()) < 5:
            return {"label": "rejected", "reason": "content_too_short", "confidence": 1.0}

        # 2. Banned Words (Basic Spam/Abuse Filter)
        text_lower = text.lower()
        if any(banned in text_lower for banned in cls.BANNED_WORDS):
            return {"label": "rejected", "reason": "banned_words_detected", "confidence": 1.0}

        # 3. Excessive URL checking (could be spam)
        url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        urls_found = url_pattern.findall(text)
        if len(urls_found) > 3:
            return {"label": "rejected", "reason": "excessive_urls", "confidence": 1.0}
            
        return None
