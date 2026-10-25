# TrustLens — Production Deployment Guide

This guide covers complete, production-ready deployment of the TrustLens Fake Review & Spam Intelligence Platform.

---

## Architecture Overview

```
                      +-----------------------------+
                      |         Web Client          |
                      | (Browser / Desktop / Mobile)|
                      +--------------+--------------+
                                     |
                       HTTPS (Custom Domain / Cloud)
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
  +------------------------+                   +------------------------+
  |    Frontend (Vercel)   |                   |    Backend (Render)    |
  |  Next.js 14 App Router |                   |   FastAPI + ML Engine  |
  +------------------------+                   +-----------+------------+
                                                           |
                                            SQLAlchemy / PostgreSQL
                                                           |
                                                           v
                                               +------------------------+
                                               |  Managed PostgreSQL DB |
                                               | (Neon / Supabase / AWS)|
                                               +------------------------+
```

---

## Option 1: Cloud Serverless / Managed Deployment (Recommended)

### 1. Database Provisioning (Managed PostgreSQL)
TrustLens uses SQLAlchemy 2.0 and supports both SQLite (local development) and PostgreSQL (production).
1. Create a free PostgreSQL instance on **[Neon](https://neon.tech)**, **[Supabase](https://supabase.com)**, or **Render**.
2. Note your connection string:
   ```env
   DATABASE_URL=postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/trustlens?sslmode=require
   ```

---

### 2. Backend Deployment (Render / Railway)

#### Deploying on Render:
1. Fork or push this repository to GitHub.
2. Log into **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `trustlens-api`
   - **Language**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**:
     ```bash
     pip install --no-cache-dir -r requirements.txt && python scripts/train.py
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
6. Add Environment Variables:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://...` | Connection URI to production database |
   | `SECRET_KEY` | `[generate 32-char secret]` | Session and payload signing key |
   | `CORS_ORIGINS` | `["https://trustlens.yourdomain.com", "https://*.vercel.app"]` | Allowed origins |
   | `RATE_LIMIT_DEFAULT`| `120/minute` | Global IP rate limit |
   | `RATE_LIMIT_ANALYZE`| `30/minute` | Heavy endpoint rate limit |
7. Deploy the service. Once built, note your live API URL (e.g. `https://trustlens-api.onrender.com`).

---

### 3. Frontend Deployment (Vercel)

1. Log into **[Vercel](https://vercel.com)**.
2. Click **Add New...** → **Project**.
3. Select your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset will auto-detect as **Next.js**.
6. In **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://trustlens-api.onrender.com/api
   ```
7. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://trustlens.vercel.app`).

---

### 4. Custom Domains & CORS Finalization
1. Add your custom domain in Vercel (e.g. `trustlens.ai`).
2. Add your custom API domain in Render (e.g. `api.trustlens.ai`).
3. Update `CORS_ORIGINS` in Render:
   ```env
   CORS_ORIGINS=["https://trustlens.ai","https://www.trustlens.ai"]
   ```

---

## Option 2: Single-Server VPS Deployment (Docker Compose)

For running on an AWS EC2, DigitalOcean Droplet, Hetzner, or Linode server running Ubuntu 22.04 / 24.04:

### 1. Prerequisites
Install Docker and Docker Compose on your server:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

### 2. Clone Repository & Setup Environment
```bash
git clone https://github.com/your-username/TrustLens.git /opt/trustlens
cd /opt/trustlens

# Copy and edit production environment variables
cp .env.example .env
nano .env
```

Ensure your `.env` contains:
```env
DATABASE_URL=sqlite:///./trustlens.db
SECRET_KEY=generate_a_secure_random_key_here
CORS_ORIGINS=["http://localhost:3000","http://your-domain.com"]
NEXT_PUBLIC_API_URL=http://your-domain.com:8000/api
```

### 3. Launch with Docker Compose
```bash
docker compose up -d --build
```

Verify containers are running:
```bash
docker compose ps
docker compose logs -f backend
```

---

### 4. Setup Automated SSL Reverse Proxy with Caddy

Install Caddy:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Configure `/etc/caddy/Caddyfile`:
```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:8000
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```
Caddy will automatically provision and maintain free Let's Encrypt SSL certificates.

---

## Production Health & Monitoring

| Endpoint | Expected Status | Purpose |
| :--- | :--- | :--- |
| `GET https://your-domain.com/api/health` | `HTTP 200 OK` | Verifies ML model status and backend availability |
| `GET https://your-domain.com/api/demos` | `HTTP 200 OK` | Verifies bundled demo dataset catalog |
| `GET https://your-domain.com/` | `HTTP 200 OK` | Verifies Next.js client rendering |
