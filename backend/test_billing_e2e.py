import requests
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    getattr(sys.stdout, "reconfigure")(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api"


def run_tests():
    print("--- 1. Authenticating Demo User ---")
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "demo@resumeiq.ai",
        "password": "password123"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("Authenticated successfully.")

    print("\n--- 2. Fetching Billing Overview ---")
    overview_resp = requests.get(f"{BASE_URL}/billing/overview", headers=headers)
    assert overview_resp.status_code == 200, f"Billing overview failed: {overview_resp.text}"
    overview = overview_resp.json()
    print(f"Current Plan: {overview['current_plan']}")
    print(f"Subscription Status: {overview.get('subscription', {}).get('status')}")
    print(f"Usage: {overview['usage']['analyses_used']} analyses used (Max: {overview['usage']['max_analyses']})")
    print(f"Resumes uploaded: {overview['usage']['resumes_uploaded']}, AI generations: {overview['usage']['ai_generations_used']}")
    print(f"Invoices count: {len(overview['invoices'])}, Payments count: {len(overview['payments'])}")

    print("\n--- 3. Creating Stripe Checkout Session for Pro ---")
    stripe_resp = requests.post(f"{BASE_URL}/billing/checkout", json={"plan_id": "pro", "provider": "stripe"}, headers=headers)
    assert stripe_resp.status_code == 200
    stripe_data = stripe_resp.json()
    print(f"Stripe Session ID: {stripe_data.get('session_id')}, Amount: {stripe_data.get('amount')} {stripe_data.get('currency')}")

    print("\n--- 4. Creating Razorpay Checkout Session for Recruiter ---")
    razor_resp = requests.post(f"{BASE_URL}/billing/checkout", json={"plan_id": "recruiter", "provider": "razorpay"}, headers=headers)
    assert razor_resp.status_code == 200
    razor_data = razor_resp.json()
    print(f"Razorpay Order ID: {razor_data.get('order_id')}, Amount(paise): {razor_data.get('amount')} {razor_data.get('currency')}")

    print("\n--- 5. Verifying Payment & Upgrading to Recruiter ---")
    verify_resp = requests.post(f"{BASE_URL}/billing/verify-payment", json={
        "plan_id": "recruiter",
        "provider": "razorpay",
        "payment_id": "pay_test_rzp_9999",
        "payment_method": "upi"
    }, headers=headers)
    assert verify_resp.status_code == 200
    print("Payment verify response:", verify_resp.json())

    # Verify overview updated to recruiter
    overview2 = requests.get(f"{BASE_URL}/billing/overview", headers=headers).json()
    print(f"Updated Plan: {overview2['current_plan']}, Status: {overview2['subscription']['status']}")
    assert overview2['current_plan'] == "recruiter"

    print("\n--- 6. Simulating Payment Failure ---")
    fail_resp = requests.post(f"{BASE_URL}/billing/simulate/failed-payment", json={
        "provider": "stripe",
        "reason": "Card declined: Insufficient funds"
    }, headers=headers)
    assert fail_resp.status_code == 200
    print("Simulation status:", fail_resp.json())
    overview3 = requests.get(f"{BASE_URL}/billing/overview", headers=headers).json()
    print(f"Plan status after failure: {overview3['subscription']['status']}")
    assert overview3['subscription']['status'] == "past_due"

    print("\n--- 7. Simulating Trial Expiration (Revert to Free) ---")
    trial_resp = requests.post(f"{BASE_URL}/billing/simulate/trial-expiration", json={}, headers=headers)
    assert trial_resp.status_code == 200
    print("Trial expiration response:", trial_resp.json())
    overview4 = requests.get(f"{BASE_URL}/billing/overview", headers=headers).json()
    print(f"Plan after trial expiration: {overview4['current_plan']}, Status: {overview4['subscription']['status']}")
    assert overview4['current_plan'] == "free"
    assert overview4['usage']['max_analyses'] == 3

    print("\n--- 8. Canceling / Downgrading ---")
    restore_resp = requests.post(f"{BASE_URL}/billing/verify-payment", json={
        "plan_id": "pro",
        "provider": "stripe",
        "payment_id": "pi_restore_1234",
        "payment_method": "card"
    }, headers=headers)
    assert restore_resp.status_code == 200
    cancel_resp = requests.post(f"{BASE_URL}/billing/cancel", json={"immediate": False}, headers=headers)
    assert cancel_resp.status_code == 200
    print("Cancel response:", cancel_resp.json())
    overview5 = requests.get(f"{BASE_URL}/billing/overview", headers=headers).json()
    print(f"Cancel at period end flag: {overview5['subscription']['cancel_at_period_end']}")
    assert overview5['subscription']['cancel_at_period_end'] is True

    print("\n--- 9. Frontend Route HTTP Check ---")
    fe_resp = requests.get("http://localhost:3000/billing")
    print(f"Frontend /billing status code: {fe_resp.status_code}")
    assert fe_resp.status_code == 200
    assert "Billing Management" in fe_resp.text or "Billing" in fe_resp.text

    print("\n=== ALL E2E BILLING TESTS PASSED! ===")

if __name__ == "__main__":
    run_tests()
