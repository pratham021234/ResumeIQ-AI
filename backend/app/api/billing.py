import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional, get_current_user
from app.models.models import (
    User, Subscription, Plan, Invoice, Payment, UsageTracker
)
from app.schemas.schemas import (
    BillingOverviewOut, PlanOut, SubscriptionOut, InvoiceOut, PaymentOut,
    UsageTrackerOut, CheckoutSessionCreate, CheckoutSessionOut,
    PaymentVerifyRequest, SubscriptionCancelRequest, SimulationActionRequest
)
from app.services.billing_service import BillingService
from app.core.config import settings

router = APIRouter(prefix="/billing", tags=["Subscription Billing"])

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def is_past(dt: Optional[datetime]) -> bool:
    if not dt:
        return False
    if getattr(dt, "tzinfo", None) is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt < datetime.now(timezone.utc)


@router.get("/overview", response_model=BillingOverviewOut)
def get_billing_overview(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve current user plan, active subscription, usage metrics, invoices, and payment history."""
    BillingService.seed_plans(db)

    # Demo fallback user if unauthenticated
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            current_user = db.query(User).first()
            if not current_user:
                raise HTTPException(status_code=404, detail="User not found")

    user_plan = str(getattr(current_user, "plan", "free") or "free")

    # Fetch active subscription
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.created_at.desc()).first()

    # If no subscription exists, create a default free one
    if not sub:
        sub = Subscription(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            plan=user_plan,
            provider="system",
            status="active",
            current_period_start=utc_now(),
            current_period_end=utc_now() + timedelta(days=365),
            cancel_at_period_end=False,
            created_at=utc_now()
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    # Check trial expiration
    if sub and getattr(sub, "trial_end", None):
        trial_end = getattr(sub, "trial_end")
        if is_past(trial_end) and getattr(sub, "status", "") == "active":
            setattr(sub, "status", "expired")
            setattr(current_user, "plan", "free")
            db.commit()
            user_plan = "free"

    # Usage
    usage = BillingService.get_or_create_usage(str(current_user.id), db)
    can_analyze, _ = BillingService.check_can_analyze(current_user, db)
    max_analyses = 3 if user_plan == "free" else -1

    usage_out = UsageTrackerOut(
        month=str(getattr(usage, "month", "")),
        analyses_used=int(getattr(usage, "analyses_used", 0) or 0),
        max_analyses=max_analyses,
        resumes_uploaded=int(getattr(usage, "resumes_uploaded", 0) or 0),
        ai_generations_used=int(getattr(usage, "ai_generations_used", 0) or 0),
        can_analyze=can_analyze
    )

    # Plans
    plans_records = db.query(Plan).all()
    plans_out = [
        PlanOut(
            id=str(p.id),
            name=str(p.name),
            price_inr=int(getattr(p, "price_inr", 0) or 0),
            billing_interval=str(getattr(p, "billing_interval", "month")),
            features=list(getattr(p, "features", []) or []),
            max_analyses=int(getattr(p, "max_analyses", 3) or 3),
            allows_tailor=bool(getattr(p, "allows_tailor", False)),
            allows_cover_letter=bool(getattr(p, "allows_cover_letter", False)),
            allows_recruiter=bool(getattr(p, "allows_recruiter", False))
        )
        for p in plans_records
    ]

    # Invoices
    invoices_records = db.query(Invoice).filter(
        Invoice.user_id == current_user.id
    ).order_by(Invoice.created_at.desc()).limit(20).all()
    invoices_out = [
        InvoiceOut(
            id=str(inv.id),
            invoice_number=str(inv.invoice_number),
            provider=str(inv.provider),
            amount=float(getattr(inv, "amount", 0.0) or 0.0),
            currency=str(getattr(inv, "currency", "INR")),
            status=str(inv.status),
            plan_name=str(inv.plan_name),
            paid_at=getattr(inv, "paid_at", None),
            created_at=getattr(inv, "created_at", utc_now())
        )
        for inv in invoices_records
    ]

    # Payments
    payments_records = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).limit(20).all()
    payments_out = [
        PaymentOut(
            id=str(pay.id),
            provider=str(pay.provider),
            provider_payment_id=str(pay.provider_payment_id or ""),
            amount=float(getattr(pay, "amount", 0.0) or 0.0),
            currency=str(getattr(pay, "currency", "INR")),
            status=str(pay.status),
            payment_method=str(getattr(pay, "payment_method", "card")),
            failure_reason=getattr(pay, "failure_reason", None),
            created_at=getattr(pay, "created_at", utc_now())
        )
        for pay in payments_records
    ]

    sub_out = SubscriptionOut(
        id=str(sub.id),
        user_id=str(sub.user_id),
        plan=str(sub.plan),
        provider=str(getattr(sub, "provider", "stripe")),
        provider_subscription_id=getattr(sub, "provider_subscription_id", None),
        status=str(sub.status),
        current_period_start=getattr(sub, "current_period_start", None),
        current_period_end=getattr(sub, "current_period_end", None),
        cancel_at_period_end=bool(getattr(sub, "cancel_at_period_end", False)),
        trial_end=getattr(sub, "trial_end", None),
        created_at=getattr(sub, "created_at", utc_now())
    )

    return BillingOverviewOut(
        current_plan=user_plan,
        subscription=sub_out,
        usage=usage_out,
        plans=plans_out,
        invoices=invoices_out,
        payments=payments_out
    )

@router.post("/checkout", response_model=CheckoutSessionOut)
def create_checkout_session(
    data: CheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Initiate Stripe or Razorpay checkout session for plan upgrade."""
    BillingService.seed_plans(db)

    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    try:
        session_info = BillingService.create_checkout_session(
            user=current_user,
            plan_id=data.plan_id.lower(),
            provider=data.provider.lower(),
            db=db
        )
        return CheckoutSessionOut(**session_info)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-payment")
def verify_and_activate_payment(
    data: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Verify payment and activate the target subscription tier."""
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    try:
        result = BillingService.activate_subscription(
            user=current_user,
            plan_id=data.plan_id.lower(),
            provider=data.provider.lower(),
            payment_id=data.payment_id,
            payment_method=data.payment_method or "card",
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/downgrade")
def downgrade_subscription(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Downgrade plan to Free tier."""
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    result = BillingService.cancel_subscription(user=current_user, db=db, immediate=True)
    return result

@router.post("/cancel")
def cancel_subscription(
    data: SubscriptionCancelRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Cancel subscription at period end or immediately."""
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    result = BillingService.cancel_subscription(
        user=current_user,
        db=db,
        immediate=data.immediate
    )
    return result

@router.post("/simulate/failed-payment")
def simulate_failed_payment(
    data: SimulationActionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Simulate a failed recurring charge (e.g. expired card, insufficient funds)."""
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    result = BillingService.simulate_payment_failure(
        user=current_user,
        provider=data.provider,
        reason=data.reason or "Card declined by issuing bank",
        db=db
    )
    return result

@router.post("/simulate/trial-expiration")
def simulate_trial_expiration(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Simulate trial expiring and reverting user to Free tier."""
    if not current_user:
        current_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")

    result = BillingService.simulate_trial_expiration(user=current_user, db=db)
    return result

# Webhooks
@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe asynchronous webhook events."""
    payload = await request.body()
    # In live mode: stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    return {"status": "received", "provider": "stripe", "timestamp": utc_now().isoformat()}

@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Razorpay asynchronous webhook events."""
    payload = await request.body()
    # In live mode: verify razorpay signature header
    return {"status": "received", "provider": "razorpay", "timestamp": utc_now().isoformat()}
