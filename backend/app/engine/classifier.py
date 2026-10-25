import os
import joblib
import numpy as np
from typing import List, Dict, Any, Tuple
from backend.app.core.config import settings

class FakeReviewClassifier:
    _instance = None

    def __init__(self):
        self.vectorizer = None
        self.classifier = None
        self.is_loaded = False
        self.feature_names = None
        self.coefs = None
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = FakeReviewClassifier()
        return cls._instance

    def load_model(self):
        model_path = settings.MODEL_PATH
        if os.path.exists(model_path):
            try:
                artifact = joblib.load(model_path)
                self.vectorizer = artifact["vectorizer"]
                self.classifier = artifact["classifier"]
                self.feature_names = np.array(self.vectorizer.get_feature_names_out())
                self.coefs = self.classifier.coef_[0]
                self.is_loaded = True
                print(f"[FakeReviewClassifier] Model successfully loaded from {model_path}")
            except Exception as e:
                print(f"[FakeReviewClassifier] Warning: Could not load model: {e}")
                self.is_loaded = False
        else:
            print(f"[FakeReviewClassifier] Model file not found at {model_path}. Will use heuristic fallback until trained.")
            self.is_loaded = False

    def predict_single(self, text: str) -> Dict[str, Any]:
        """
        Runs ML inference on a single review text and extracts token-level feature attribution.
        """
        if not text or not text.strip():
            return {
                "fake_probability": 10.0,
                "token_attributions": []
            }

        if not self.is_loaded:
            # Fallback heuristic if model is loading
            from backend.app.engine.linguistic import evaluate_linguistic_signals
            ling = evaluate_linguistic_signals(text)
            prob = min(95.0, max(5.0, ling["linguistic_risk_score"] * 0.8))
            return {
                "fake_probability": round(prob, 1),
                "token_attributions": [
                    {"word": s, "weight": 0.5, "type": "suspicious"}
                    for s in ling["suspicious_snippets"][:5]
                ]
            }

        # Model Inference
        X_vec = self.vectorizer.transform([text])
        prob = float(self.classifier.predict_proba(X_vec)[0, 1]) * 100.0
        
        # Word Attribution (Feature Coefficients)
        attributions = self.explain_prediction(X_vec[0], text)
        
        return {
            "fake_probability": round(prob, 1),
            "token_attributions": attributions
        }

    def explain_prediction(self, sparse_vector, raw_text: str) -> List[Dict[str, Any]]:
        """
        Calculates localized token contribution weights using TF-IDF value * linear coefficient.
        """
        indices = sparse_vector.indices
        data = sparse_vector.data
        
        token_contributions = []
        for idx, tfidf_val in zip(indices, data):
            word = self.feature_names[idx]
            weight = float(tfidf_val * self.coefs[idx])
            token_contributions.append((word, weight))
            
        # Sort by magnitude of contribution
        token_contributions.sort(key=lambda x: abs(x[1]), reverse=True)
        
        results = []
        for word, weight in token_contributions[:8]:
            if abs(weight) >= 0.05:
                results.append({
                    "word": word,
                    "weight": round(weight, 3),
                    "type": "suspicious" if weight > 0 else "authentic"
                })
                
        return results

    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        High performance batch inference for hundreds of reviews.
        """
        if not texts:
            return []

        if not self.is_loaded:
            return [self.predict_single(t) for t in texts]

        clean_texts = [t if t and t.strip() else "good" for t in texts]
        X_vecs = self.vectorizer.transform(clean_texts)
        probs = self.classifier.predict_proba(X_vecs)[:, 1] * 100.0

        results = []
        for i, text in enumerate(clean_texts):
            attributions = self.explain_prediction(X_vecs[i], text)
            results.append({
                "fake_probability": round(float(probs[i]), 1),
                "token_attributions": attributions
            })
        return results
