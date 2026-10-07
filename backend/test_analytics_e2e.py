import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("--- 1. Testing Event Ingestion Endpoint ---")
    events_to_test = [
        {"event_name": "landing_page_visit", "category": "acquisition", "url": "/", "referrer": "https://google.com"},
        {"event_name": "user_signup", "category": "activation", "properties": {"plan": "free"}},
        {"event_name": "first_analysis_completed", "category": "activation", "properties": {"ats_score": 88.5}},
        {"event_name": "analysis_created", "category": "engagement", "properties": {"ats_score": 91.0}},
        {"event_name": "resume_uploaded", "category": "engagement", "properties": {"file_type": "application/pdf"}},
        {"event_name": "tailor_used", "category": "engagement", "properties": {"job_title": "Staff Backend Engineer"}},
        {"event_name": "subscription_upgraded", "category": "revenue", "properties": {"plan_id": "pro", "amount_inr": 299}},
        {"event_name": "subscription_canceled", "category": "revenue", "properties": {"plan_id": "pro", "mrr_lost": 299}}
    ]

    for ev in events_to_test:
        resp = requests.post(f"{BASE_URL}/analytics/event", json=ev)
        assert resp.status_code == 200, f"Failed event {ev['event_name']}: {resp.text}"
        data = resp.json()
        assert data["success"] is True
        print(f"  ✓ {ev['event_name']} ({ev['category']}) -> ID: {data['event_id']}, Source: {data['source']}")

    print("\n--- 2. Testing Admin Analytics Overview (30 Days) ---")
    overview_resp = requests.get(f"{BASE_URL}/analytics/admin/overview?days=30")
    assert overview_resp.status_code == 200, f"Admin overview failed: {overview_resp.text}"
    data = overview_resp.json()

    ov = data["overview"]
    print(f"  MRR: ₹{ov['mrr']:,} (Growth: +{ov['mrr_growth_rate_pct']}%)")
    print(f"  ARR: ₹{ov['arr']:,}")
    print(f"  Net Churn Rate: {ov['churn_rate_pct']}% (Churned MRR: ₹{ov['churned_mrr']:,})")
    print(f"  Total Visitors: {ov['total_visitors']:,}")
    print(f"  Total Signups: {ov['total_signups']:,}")
    print(f"  Total Activations: {ov['total_activations']:,} (Rate: {ov['activation_rate_pct']}%)")
    print(f"  Total Analyses Created: {ov['total_analyses']:,}")
    print(f"  PostHog Status: {'Enabled' if ov['posthog_enabled'] else 'Disabled'} ({ov['posthog_key_masked']})")
    print(f"  GA4 Status: {'Enabled' if ov['ga4_enabled'] else 'Disabled'} ({ov['ga_measurement_id']})")
    print(f"  Privacy Compliance: {'GDPR & CCPA Compliant' if ov['privacy_compliant'] else 'Non-compliant'}")

    assert ov["mrr"] > 0
    assert ov["arr"] > 0
    assert ov["total_visitors"] > 0

    print("\n--- 3. Testing 5-Stage Conversion Funnel ---")
    funnel = data["conversion_funnel"]
    assert len(funnel) == 5, f"Expected 5 funnel steps, got {len(funnel)}"
    for step in funnel:
        print(f"  [{step['step']}] ({step['stage']}): {step['count']:,} users ({step['percentage']}%) - Dropoff: {step['drop_off_pct']}%")

    print("\n--- 4. Testing Top Landing Pages ---")
    pages = data["top_landing_pages"]
    assert len(pages) > 0
    for p in pages:
        print(f"  {p['path']} -> {p['visitors']:,} visitors, {p['signups']} signups, Bounce: {p['bounce_rate']}%, Conv: {p['conversion_rate']}%")

    print("\n--- 5. Testing Traffic Sources ---")
    sources = data["traffic_sources"]
    assert len(sources) > 0
    for s in sources:
        print(f"  {s['source']}: {s['percentage']}% ({s['visitors']:,} visitors)")

    print("\n--- 6. Testing Revenue & Signup Charts ---")
    rev_chart = data["revenue_chart"]
    signup_chart = data["signup_chart"]
    assert len(rev_chart) == 30, f"Expected 30 revenue points, got {len(rev_chart)}"
    assert len(signup_chart) == 30, f"Expected 30 signup points, got {len(signup_chart)}"
    print(f"  Revenue chart: {len(rev_chart)} points (Latest day revenue: ₹{rev_chart[-1]['revenue']}, MRR: ₹{rev_chart[-1]['mrr']:,})")
    print(f"  Signup chart: {len(signup_chart)} points (Latest day signups: {signup_chart[-1]['signups']}, activations: {signup_chart[-1]['activations']})")

    print("\n--- 7. Testing Frontend Admin Routes HTTP Check ---")
    fe_resp = requests.get("http://localhost:3000/admin/analytics")
    print(f"  Frontend /admin/analytics HTTP status: {fe_resp.status_code}")
    assert fe_resp.status_code == 200
    assert "Product &amp; Revenue Analytics" in fe_resp.text or "Analytics" in fe_resp.text

    fe_resp2 = requests.get("http://localhost:3000/admin")
    print(f"  Frontend /admin HTTP status: {fe_resp2.status_code}")
    assert fe_resp2.status_code == 200

    print("\n=== ALL E2E ANALYTICS TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
