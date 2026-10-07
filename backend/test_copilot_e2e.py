import requests

BASE = "http://127.0.0.1:8000/api"

print("--- 1. Testing GET /copilot/jobs ---")
res_jobs = requests.get(f"{BASE}/copilot/jobs")
print("Status:", res_jobs.status_code)
jobs = res_jobs.json()
print("Jobs count:", len(jobs))
if jobs:
    print("Sample job:", jobs[0]["title"], "Cand count:", jobs[0]["candidate_count"])

print("\n--- 2. Testing GET /copilot/candidates ---")
res_cands = requests.get(f"{BASE}/copilot/candidates")
print("Status:", res_cands.status_code)
cands = res_cands.json()
print("Candidates count:", len(cands))
if cands:
    first = cands[0]
    print("Top candidate:", first["candidate_name"], "ATS:", first["ats_score"], "Verdict:", first["hiring_decision"])

    print("\n--- 3. Testing GET /copilot/candidate/{analysis_id} ---")
    aid = first["analysis_id"]
    res_det = requests.get(f"{BASE}/copilot/candidate/{aid}")
    print("Status:", res_det.status_code)
    det = res_det.json()
    print("Decision Reasoning:", det["decision_reasoning"][:80], "...")
    print("Interview Questions generated:", len(det["interview_questions"]))
    for q in det["interview_questions"]:
        print(f"  - [{q['category']}] {q['question'][:70]}...")

    print("\n--- 4. Testing PUT /copilot/candidate/{analysis_id}/stage ---")
    res_stage = requests.put(f"{BASE}/copilot/candidate/{aid}/stage", json={
        "stage": "Interview",
        "hiring_decision": "Strong Yes",
        "recruiter_notes": "Passed initial screening with flying colors. Advancing to System Design interview.",
        "rating": 5
    })
    print("Stage update status:", res_stage.status_code)
    print("Updated stage:", res_stage.json()["stage"], "Notes:", res_stage.json()["recruiter_notes"])

print("\n--- 5. Testing GET /copilot/analytics ---")
res_ana = requests.get(f"{BASE}/copilot/analytics")
print("Status:", res_ana.status_code)
ana = res_ana.json()
print("Total Screened:", ana["total_screened"])
print("Shortlisted count:", ana["shortlisted_count"])
print("Top pool gaps:", [g["skill"] for g in ana["top_pool_skill_gaps"][:4]])
print("Stage funnel:", len(ana["stage_funnel"]))

print("\n=== COPILOT BACKEND TEST COMPLETED SUCCESSFULLY! ===")
