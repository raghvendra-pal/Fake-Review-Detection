# TrustLens Dataset Documentation

**Document:** `docs/DATA.md`  
**Version:** 1.0.0  
**Updated:** November 2026  

---

## 1. Overview & Data Sources

TrustLens is trained and evaluated to detect synthetic, incentivized, templated, and deceptive consumer reviews across multiple domains (e-commerce, hospitality, mobile applications, and local businesses).

### Data Provenance
1. **Public E-Commerce & Hospitality Corpus:**
   - Deceptive Review Dataset (Ott et al. Chicago benchmark): 1,600 verified genuine and MTurk deceptive hotel reviews.
   - Amazon Product Review Sentiment & Authenticity Corpus: Stratified subsets across electronics, beauty, and household goods.
2. **Deterministic Synthetic Review Generator:**
   - Located at: `backend/scripts/generate_synthetic_reviews.py`
   - Purpose: Provides guaranteed deterministic data generation for continuous integration, offline benchmark reproduction, and localized edge testing.
   - Generation Templates:
     - **Deceptive Patterns:** Hyperbolic praise, excessive superlatives ("miracle product", "life changing", "buy this immediately"), templated keyword stuffing, random username suffixes (`user_91823`, `sarah_8819`).
     - **Authentic Patterns:** Balanced critiques, product dimension specifics (materials, battery measurements, cable lengths), verified purchase flags, nuanced neutral-to-critical pros/cons.

---

## 2. Dataset Hygiene & Preprocessing

- **Deduplication:** Near-duplicate removal using Jaccard token similarity (threshold $\ge 0.85$) to prevent data leakage between train and test splits.
- **Normalization:** Lowercasing, punctuation stripping for TF-IDF tokenization, preserving emoji representations for linguistic signal scoring.
- **Leakage Prevention:**
  - Group-aware train/test splitting based on reviewer ID and product ID.
  - Reviews from the same reviewer or business listing never cross the train/test boundary.
- **Target Variable:** Binary classification:
  - `0`: Authentic / Organic review.
  - `1`: Deceptive / Fake review.

---

## 3. Class Balance & Sampling Strategy

- **Class Distribution:** Balanced 50/50 distribution in training benchmarks to prevent majority-class bias.
- **Evaluation Split:** 80% train, 20% held-out test split with stratified sampling.

---

## 4. Licenses & Attribution

- Deceptive Review Corpus: Creative Commons Attribution (CC-BY 4.0).
- Open Source Benchmarks: Apache 2.0 / MIT.
- The TrustLens synthetic generator is licensed under the project's MIT License.
