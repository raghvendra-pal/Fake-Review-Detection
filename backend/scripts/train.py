import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.insert(0, _cur_dir)

import csv
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, classification_report
)

def train_and_evaluate(data_path: str, model_save_path: str, manifest_save_path: str):
    print("=" * 60)
    print("TrustLens Fake Review Classifier: Training & Evaluation")
    print("=" * 60)
    
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Running generator...")
        from generate_data import generate_synthetic_dataset
        generate_synthetic_dataset(data_path, count=6000)
        
    X = []
    y = []
    with open(data_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            txt = row.get("review_text", "").strip()
            lbl = row.get("label")
            if txt and lbl is not None and lbl != "":
                X.append(txt)
                y.append(int(lbl))
                
    X = np.array(X)
    y = np.array(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    
    # 1. Feature Extraction: Sublinear TF-IDF with Unigrams and Bigrams
    print("Extracting TF-IDF n-gram features...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=12000,
        sublinear_tf=True,
        stop_words="english",
        strip_accents="unicode"
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # 2. Classifier: Calibrated Logistic Regression
    print("Fitting Logistic Regression model...")
    clf = LogisticRegression(
        C=2.0,
        max_iter=1000,
        solver="liblinear",
        class_weight="balanced",
        random_state=42
    )
    clf.fit(X_train_vec, y_train)
    
    # 3. Model Evaluation
    y_pred = clf.predict(X_test_vec)
    y_prob = clf.predict_proba(X_test_vec)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("\n--- Evaluation Metrics on Holdout Test Split ---")
    print(f"Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision: {prec:.4f} ({prec*100:.2f}%)")
    print(f"Recall:    {rec:.4f} ({rec*100:.2f}%)")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"Confusion Matrix: [TN: {cm[0][0]}, FP: {cm[0][1]}], [FN: {cm[1][0]}, TP: {cm[1][1]}]")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Authentic", "Deceptive/Fake"]))
    
    # 4. Feature Importance (Top Words)
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefs = clf.coef_[0]
    
    # Top deceptive indicators (highest positive coefficients)
    top_fake_idx = np.argsort(coefs)[-25:][::-1]
    top_fake_words = [{"word": feature_names[i], "coefficient": round(float(coefs[i]), 4)} for i in top_fake_idx]
    
    # Top authentic indicators (lowest negative coefficients)
    top_auth_idx = np.argsort(coefs)[:25]
    top_auth_words = [{"word": feature_names[i], "coefficient": round(float(coefs[i]), 4)} for i in top_auth_idx]
    
    # 5. Persist Model and Manifest
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    pipeline_artifact = {
        "vectorizer": vectorizer,
        "classifier": clf
    }
    joblib.dump(pipeline_artifact, model_save_path)
    print(f"Saved model pipeline artifact to: {model_save_path}")
    
    # Compute SHA-256 checksum for model artifact verification
    import hashlib
    hasher = hashlib.sha256()
    with open(model_save_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    model_sha256 = hasher.hexdigest()
    print(f"Model SHA-256: {model_sha256}")
    
    manifest = {
        "model_architecture": "TF-IDF (1,2) + LogisticRegression(C=2.0, balanced)",
        "vocabulary_size": len(vectorizer.vocabulary_),
        "sha256": model_sha256,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": cm,
            "test_sample_count": len(y_test),
            "train_sample_count": len(y_train)
        },
        "top_deceptive_indicators": top_fake_words[:15],
        "top_authentic_indicators": top_auth_words[:15]
    }
    
    with open(manifest_save_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved model evaluation manifest to: {manifest_save_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, "..", "data", "synthetic_reviews.csv")
    model_file = os.path.join(base_dir, "..", "models", "fake_review_model.joblib")
    manifest_file = os.path.join(base_dir, "..", "models", "model_manifest.json")
    
    train_and_evaluate(data_file, model_file, manifest_file)
