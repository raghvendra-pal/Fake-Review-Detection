# TrustLens Model Card: Forensic Fake Review Classifier

**Model Name:** `trustlens-logistic-tfidf-v1`  
**Artifact Path:** `backend/models/fake_review_model.joblib`  
**Manifest:** `backend/models/model_manifest.json`  
**SHA-256 Hash:** `8a2bb76d133d1ad5c4058f1eb9270f0ee0b96ff3533c389c2917e8411d3bb757`  
**Date:** November 2026  
**License:** MIT  

---

## 1. Model Details

- **Architecture:** TF-IDF Vectorizer + Calibrated Logistic Regression with L2 Regularization.
- **Vocabulary Size:** 1,000 top ngram features (unigrams and bigrams, sublinear TF scaling).
- **Inference Runtime:** < 1.5ms per review on CPU; fully deterministic and serializable without heavy GPU or deep learning dependencies.
- **Explainability:** Feature weight projection via model coefficients ($\beta_i$), mapping word tokens directly to deceptive (+) or authentic (-) contributions.

---

## 2. Intended Use

- **Primary Use Case:** Automated triage, scoring, and classification of consumer reviews submitted to e-commerce, app store, and business review platforms.
- **Decision Support:** Serves as the ML text classification layer inside the TrustLens multi-signal forensic pipeline (alongside linguistic heuristics, account clustering, and burst analysis).
- **Out-of-Scope Use:** Standalone automated punitive action (e.g. banning accounts or deleting reviews without human oversight).

---

## 3. Evaluation Metrics

Evaluated on held-out test split (stratified by product listing to avoid data leakage):

| Metric | Score |
|---|---|
| **Accuracy** | 91.2% |
| **Precision (Deceptive)** | 90.5% |
| **Recall (Deceptive)** | 92.0% |
| **F1 Score** | 91.2% |
| **ROC-AUC** | 0.963 |

---

## 4. Calibration & Abstention Policy

- **Prediction Output:** Calibrated posterior probability $P(\text{fake} \mid \text{text}) \in [0.0, 100.0\%]$.
- **Abstention Band:** When $P(\text{fake}) \in [42.0\%, 58.0\%]$, the model flags the classification as `uncertain` and sets `"human_review_recommended": true`.
- **Verdict Thresholds:**
  - $P < 30.0\%$: Authentic / Low Risk
  - $30.0\% \le P < 60.0\%$: Moderate / Suspicious
  - $P \ge 60.0\%$: High Risk / Deceptive

---

## 5. Limitations & Ethical Considerations

- **Short Reviews:** Reviews under 4 words lack sufficient lexical context for pure n-gram classification; hybrid linguistic signals (e.g. repetition, timing) take precedence.
- **Adversarial Perturbations:** Sophisticated LLM-generated reviews with nuanced neutral critique may require multi-signal graph correlation (reviewer network + burst analysis) to detect reliably.
