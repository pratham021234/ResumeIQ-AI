"""
Live HTTP Endpoints Audit for ResumeIQ AI Backend
Verifies all public & protected API endpoints on 127.0.0.1:8000
"""

import sys
import json
import urllib.request
import urllib.error

API_URL = "http://127.0.0.1:8000"

results = {"passed": 0, "failed": 0, "tests": []}

def request(path, method="GET", body=None, token=None):
    url = f"{API_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_data) if resp_data else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_body)
        except Exception:
            return e.code, {"error": error_body}
    except Exception as e:
        return 0, {"error": str(e)}

def test(name, passed, msg=""):
    if passed:
        results["passed"] += 1
        print(f"  [OK] {name}: {msg}")
    else:
        results["failed"] += 1
        print(f"  [X]  {name}: {msg}")
    results["tests"].append({"name": name, "passed": passed, "msg": msg})

print("==================================================")
print("LIVE HTTP ENDPOINTS AUDIT (http://127.0.0.1:8000)")
print("==================================================")

# 1. Health & Root
s, d = request("/health")
test("GET /health", s == 200, f"Status: {s}")

s, d = request("/")
test("GET /", s == 200, f"Status: {s}, App: {d.get('app')}")

# 2. Authentication Flow
s, d = request("/api/auth/demo-login", "POST")
token = d.get("access_token")
test("POST /api/auth/demo-login", s == 200 and bool(token), f"Received JWT Token: {bool(token)}")

# 3. Security: Protected /api/auth/me WITH valid token
s, d = request("/api/auth/me", "GET", token=token)
test("GET /api/auth/me (Authenticated)", s == 200 and d.get("email") == "demo@resumeiq.ai", f"Email: {d.get('email')}")

# 4. Security: Protected /api/auth/me WITHOUT token (MUST BE 401)
s, d = request("/api/auth/me", "GET")
test("GET /api/auth/me (No Token -> 401 Enforcement)", s == 401, f"Status: {s} (Properly blocked)")

# 5. Security: Protected /api/auth/me with INVALID token (MUST BE 401)
s, d = request("/api/auth/me", "GET", token="invalid-fake-token-1234")
test("GET /api/auth/me (Invalid Token -> 401 Enforcement)", s == 401, f"Status: {s} (Properly blocked)")

# 6. Core Modules
s, d = request("/api/resumes", "GET", token=token)
test("GET /api/resumes", s == 200 and isinstance(d, list), f"Status: {s}, Resumes count: {len(d)}")

s, d = request("/api/jobs", "GET", token=token)
test("GET /api/jobs", s == 200 and isinstance(d, list), f"Status: {s}, Jobs count: {len(d)}")

# 7. AI Endpoints
s, d = request("/api/ai/improve-bullet", "POST", body={"bullet": "Worked on backend database queries", "style": "achievement"})
test("POST /api/ai/improve-bullet", s == 200 and bool(d.get("improved")), f"Status: {s}, Improved: {d.get('improved')[:40]}...")

s, d = request("/api/ai/rewrite", "POST", body={"text": "Software engineer with 4 years experience", "instruction": "Make punchy"})
test("POST /api/ai/rewrite", s == 200 and bool(d.get("rewritten")), f"Status: {s}, Rewritten: {d.get('rewritten')[:40]}...")

# 8. Subscription Billing
s, d = request("/api/billing/overview", "GET", token=token)
test("GET /api/billing/overview", s == 200 and "current_plan" in d, f"Status: {s}, Plan: {d.get('current_plan')}")

# 9. Recruiter Portal
s, d = request("/api/recruiter/jobs", "GET", token=token)
test("GET /api/recruiter/jobs", s == 200 and isinstance(d, list), f"Status: {s}, Count: {len(d)}")

s, d = request("/api/recruiter/candidates", "GET", token=token)
test("GET /api/recruiter/candidates", s == 200 and isinstance(d, list), f"Status: {s}, Count: {len(d)}")

# 10. AI Hiring Copilot Module
s, d = request("/api/copilot/jobs", "GET", token=token)
test("GET /api/copilot/jobs", s == 200 and isinstance(d, list), f"Status: {s}, Count: {len(d)}")

s, d = request("/api/copilot/candidates", "GET", token=token)
test("GET /api/copilot/candidates", s == 200 and isinstance(d, list), f"Status: {s}, Count: {len(d)}")

s, d = request("/api/copilot/analytics", "GET", token=token)
test("GET /api/copilot/analytics", s == 200 and "total_screened" in d, f"Status: {s}, Screened: {d.get('total_screened')}")

print("==================================================")
print(f"LIVE API AUDIT: {results['passed']} PASSED, {results['failed']} FAILED")
print("==================================================")

if results["failed"] > 0:
    sys.exit(1)
sys.exit(0)
