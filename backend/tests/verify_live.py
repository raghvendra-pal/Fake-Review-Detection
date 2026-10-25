import subprocess
import time
import urllib.request
import json
import sys

def verify_all():
    print("==================================================")
    print("TrustLens Live End-to-End Verification")
    print("==================================================")
    
    # 1. Start Backend on port 8000
    print("Starting FastAPI backend on port 8000...")
    backend_proc = subprocess.Popen(
        [r".\backend\venv\Scripts\python.exe", "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # 2. Start Next.js on port 3000
    print("Starting Next.js production server on port 3000...")
    frontend_proc = subprocess.Popen(
        ["npx.cmd", "next", "start", "-p", "3000"],
        cwd="frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(5)
    
    routes_to_test = [
        ("Backend Health", "http://127.0.0.1:8000/api/health", True),
        ("Backend Quick Check", "http://127.0.0.1:8000/api/quick-check", False),
        ("Backend Demo Dataset", "http://127.0.0.1:8000/api/demo/ecommerce-burst", True),
        ("Frontend Home", "http://127.0.0.1:3000/", True),
        ("Frontend Bulk Analyzer", "http://127.0.0.1:3000/bulk", True),
        ("Frontend Compare Mode", "http://127.0.0.1:3000/compare", True),
        ("Frontend Quick Check", "http://127.0.0.1:3000/quick-check", True),
        ("Frontend News Credibility", "http://127.0.0.1:3000/article-check", True),
        ("Frontend Report History", "http://127.0.0.1:3000/history", True),
        ("Frontend Methodology", "http://127.0.0.1:3000/methodology", True),
        ("Frontend API Docs", "http://127.0.0.1:3000/api-docs", True),
    ]
    
    all_passed = True
    
    try:
        for name, url, is_get in routes_to_test:
            try:
                if is_get:
                    req = urllib.request.Request(url, headers={"User-Agent": "TrustLensVerifier/1.0"})
                    resp = urllib.request.urlopen(req, timeout=8)
                    status = resp.status
                    content_len = len(resp.read())
                    print(f"[OK]   {name.ljust(28)} -> HTTP {status} (Length: {content_len} bytes)")
                else:
                    payload = json.dumps({"text": "Best product ever changed my life completely must buy 100% recommend!"}).encode()
                    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json", "User-Agent": "TrustLensVerifier/1.0"})
                    resp = urllib.request.urlopen(req, timeout=8)
                    status = resp.status
                    data = json.loads(resp.read().decode())
                    print(f"[OK]   {name.ljust(28)} -> HTTP {status} (Trust Score: {data.get('trust_score')}/100, Verdict: {data.get('verdict')})")
            except Exception as e:
                print(f"[FAIL] {name.ljust(28)} -> FAILED ({e})")
                all_passed = False
                
    finally:
        print("\nStopping background servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        
    if all_passed:
        print("\nAll endpoints and pages verified successfully with HTTP 200 OK!")
        sys.exit(0)
    else:
        print("\nSome endpoints failed.")
        sys.exit(1)

if __name__ == "__main__":
    verify_all()
