import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.models import (
    User, Subscription, Plan, Invoice, Payment, UsageTracker
)
from app.core.config import settings

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def is_past(dt: Optional[datetime]) -> bool:
    if not dt:
        return False
    if getattr(dt, "tzinfo", None) is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt < datetime.now(timezone.utc)

class BillingService:

    @staticmethod
    def seed_plans(db: Session):
        """Ensure standard billing plans exist in database."""
        plans_data = [
            {
                "id": "free",
                "name": "Free",
                "price_inr": 0,
                "billing_interval": "month",
                "features": [
                    "3 ATS Resume Scans / month",
                    "Keyword gap detection",
                    "Basic formatting audit",
                    "Single resume version"
                ],
                "max_analyses": 3,
                "allows_tailor": False,
                "allows_cover_letter": False,
                "allows_recruiter": False
            },
            {
                "id": "pro",
                "name": "Pro",
                "price_inr": 299,
                "billing_interval": "month",
                "features": [
                    "Unlimited ATS Analyses",
                    "AI Resume Tailor (role-specific)",
                    "Tailored Cover Letter Generator",
                    "AI Bullet Improver (all styles)",
                    "Full PDF Audit Reports",
                    "Multi-version resume library"
                ],
                "max_analyses": -1,  # unlimited
                "allows_tailor": True,
                "allows_cover_letter": True,
                "allows_recruiter": False
            },
            {
                "id": "recruiter",
                "name": "Recruiter",
                "price_inr": 1999,
                "billing_interval": "month",
                "features": [
                    "Everything in Pro Tier",
                    "Recruiter Dashboard & Requisitions",
                    "Bulk Resume Upload (1 to 100 files)",
                    "Deterministic Candidate Ranking Engine",
                    "Detailed AI Screening Summaries",
                    "Executive CSV & PDF Leaderboard Export"
                ],
                "max_analyses": -1,  # unlimited
                "allows_tailor": True,
                "allows_cover_letter": True,
                "allows_recruiter": True
            }
        ]

        for p_data in plans_data:
            existing = db.query(Plan).filter(Plan.id == p_data["id"]).first()
            if not existing:
                plan = Plan(
                    id=p_data["id"],
                    name=p_data["name"],
                    price_inr=p_data["price_inr"],
                    billing_interval=p_data["billing_interval"],
                    features=p_data["features"],
                    max_analyses=p_data["max_analyses"],
                    allows_tailor=p_data["allows_tailor"],
                    allows_cover_letter=p_data["allows_cover_letter"],
                    allows_recruiter=p_data["allows_recruiter"],
                    created_at=utc_now()
                )
                db.add(plan)
            else:
                setattr(existing, "price_inr", p_data["price_inr"])
                setattr(existing, "features", p_data["features"])
                setattr(existing, "allows_tailor", p_data["allows_tailor"])
                setattr(existing, "allows_cover_letter", p_data["allows_cover_letter"])
                setattr(existing, "allows_recruiter", p_data["allows_recruiter"])
        db.commit()

    @staticmethod
    def get_or_create_usage(user_id: str, db: Session) -> UsageTracker:
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        usage = db.query(UsageTracker).filter(UsageTracker.user_id == user_id).first()
        if not usage:
            usage = UsageTracker(
                id=str(uuid.uuid4()),
                user_id=user_id,
                month=current_month,
                analyses_used=0,
                resumes_uploaded=0,
                ai_generations_used=0,
                last_reset_at=utc_now()
            )
            db.add(usage)
            db.commit()
            db.refresh(usage)
        else:
            # Check for monthly reset
            if getattr(usage, "month", "") != current_month:
                setattr(usage, "month", current_month)
                setattr(usage, "analyses_used", 0)
                setattr(usage, "resumes_uploaded", 0)
                setattr(usage, "ai_generations_used", 0)
                setattr(usage, "last_reset_at", utc_now())
                db.commit()
                db.refresh(usage)
        return usage

    @staticmethod
    def check_can_analyze(user: User, db: Session) -> Tuple[bool, Optional[str]]:
        plan_str = str(getattr(user, "plan", "free") or "free").lower()
        if plan_str in ["pro", "recruiter", "enterprise"]:
            return True, None

        usage = BillingService.get_or_create_usage(str(user.id), db)
        used = int(getattr(usage, "analyses_used", 0) or 0)
        if used >= 3:
            return False, f"Monthly limit of 3 free analyses reached ({used}/3 used). Upgrade to Pro (₹299/mo) for unlimited ATS analyses."
        return True, None

    @staticmethod
    def increment_analysis_usage(user_id: str, db: Session):
        usage = BillingService.get_or_create_usage(user_id, db)
        setattr(usage, "analyses_used", int(getattr(usage, "analyses_used", 0) or 0) + 1)
        setattr(usage, "updated_at", utc_now())
        db.commit()

    @staticmethod
    def increment_resume_upload(user_id: str, db: Session):
        usage = BillingService.get_or_create_usage(user_id, db)
        setattr(usage, "resumes_uploaded", int(getattr(usage, "resumes_uploaded", 0) or 0) + 1)
        setattr(usage, "updated_at", utc_now())
        db.commit()

    @staticmethod
    def increment_ai_generation(user_id: str, db: Session):
        usage = BillingService.get_or_create_usage(user_id, db)
        setattr(usage, "ai_generations_used", int(getattr(usage, "ai_generations_used", 0) or 0) + 1)
        setattr(usage, "updated_at", utc_now())
        db.commit()

    @staticmethod
    def check_feature_access(user: User, feature: str, db: Session) -> Tuple[bool, Optional[str]]:
        """Check feature gating for user."""
        plan_str = str(getattr(user, "plan", "free") or "free").lower()
        
        # Trial expiration check
        sub = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).order_by(Subscription.created_at.desc()).first()

        if sub and getattr(sub, "trial_end", None):
            trial_end = getattr(sub, "trial_end")
            if is_past(trial_end):
                setattr(sub, "status", "expired")
                setattr(user, "plan", "free")
                db.commit()
                plan_str = "free"

        if feature == "analysis":
            return BillingService.check_can_analyze(user, db)

        if feature == "tailor":
            if plan_str in ["pro", "recruiter", "enterprise"]:
                return True, None
            return False, "AI Resume Tailor requires a Pro Pass (₹299/mo) or Recruiter Plan."

        if feature == "cover_letter":
            if plan_str in ["pro", "recruiter", "enterprise"]:
                return True, None
            return False, "Cover Letter Generator requires a Pro Pass (₹299/mo) or Recruiter Plan."

        if feature == "recruiter":
            if plan_str in ["recruiter", "enterprise"] or bool(user.is_recruiter):
                return True, None
            return False, "Recruiter Portal requires a Recruiter Subscription (₹1999/mo)."

        return True, None

    @staticmethod
    def create_checkout_session(
        user: User,
        plan_id: str,
        provider: str, # "stripe" or "razorpay"
        db: Session
    ) -> Dict[str, Any]:
        """Initiate payment/checkout flow with Stripe or Razorpay."""
        plan = db.query(Plan).filter(Plan.id == plan_id).first()
        if not plan:
            raise ValueError(f"Invalid plan: {plan_id}")

        amount = int(getattr(plan, "price_inr", 0) or 0)
        session_id = f"{provider}_sess_{uuid.uuid4().hex[:16]}"
        order_id = f"order_{provider}_{uuid.uuid4().hex[:12]}"

        if provider == "stripe":
            return {
                "provider": "stripe",
                "session_id": session_id,
                "client_secret": f"pi_{uuid.uuid4().hex[:20]}_secret_{uuid.uuid4().hex[:12]}",
                "public_key": settings.STRIPE_PUBLISHABLE_KEY,
                "amount": amount,
                "currency": "INR",
                "plan_id": plan_id,
                "plan_name": str(plan.name)
            }
        else: # Razorpay
            return {
                "provider": "razorpay",
                "order_id": order_id,
                "key_id": settings.RAZORPAY_KEY_ID,
                "amount": amount * 100, # Razorpay expects paise
                "currency": "INR",
                "plan_id": plan_id,
                "plan_name": str(plan.name)
            }

    @staticmethod
    def activate_subscription(
        user: User,
        plan_id: str,
        provider: str,
        payment_id: Optional[str],
        db: Session,
        payment_method: str = "card"
    ) -> Dict[str, Any]:
        """Activate subscription after verified payment."""
        plan = db.query(Plan).filter(Plan.id == plan_id).first()
        if not plan:
            raise ValueError("Plan not found")

        amount = float(getattr(plan, "price_inr", 0) or 0.0)

        # 1. Update User plan
        setattr(user, "plan", plan_id)
        if plan_id == "recruiter":
            setattr(user, "is_recruiter", True)

        # 2. Deactivate previous active subscriptions
        prev_subs = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).all()
        for ps in prev_subs:
            setattr(ps, "status", "canceled")
            setattr(ps, "canceled_at", utc_now())

        # 3. Create active subscription
        current_period_end = utc_now() + timedelta(days=30)
        sub = Subscription(
            id=str(uuid.uuid4()),
            user_id=str(user.id),
            plan=plan_id,
            provider=provider,
            provider_subscription_id=f"sub_{provider}_{uuid.uuid4().hex[:12]}",
            provider_customer_id=f"cus_{provider}_{uuid.uuid4().hex[:8]}",
            status="active",
            current_period_start=utc_now(),
            current_period_end=current_period_end,
            cancel_at_period_end=False,
            created_at=utc_now(),
            updated_at=utc_now()
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

        # 4. Generate Invoice
        inv_num = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        invoice = Invoice(
            id=str(uuid.uuid4()),
            user_id=str(user.id),
            subscription_id=str(sub.id),
            invoice_number=inv_num,
            provider=provider,
            provider_invoice_id=f"in_{uuid.uuid4().hex[:10]}",
            amount=amount,
            currency="INR",
            status="paid",
            plan_name=str(plan.name),
            paid_at=utc_now(),
            created_at=utc_now()
        )
        db.add(invoice)

        # 5. Record Payment
        payment = Payment(
            id=str(uuid.uuid4()),
            user_id=str(user.id),
            subscription_id=str(sub.id),
            invoice_id=str(invoice.id),
            provider=provider,
            provider_payment_id=payment_id or f"pay_{uuid.uuid4().hex[:14]}",
            amount=amount,
            currency="INR",
            status="succeeded",
            payment_method=payment_method,
            created_at=utc_now()
        )
        db.add(payment)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully subscribed to {plan.name} Plan.",
            "subscription_id": str(sub.id),
            "plan": plan_id,
            "status": "active",
            "invoice_number": inv_num,
            "amount": amount,
            "current_period_end": current_period_end.isoformat()
        }

    @staticmethod
    def cancel_subscription(user: User, db: Session, immediate: bool = False) -> Dict[str, Any]:
        """Handle cancellation of subscription."""
        sub = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).order_by(Subscription.created_at.desc()).first()

        if not sub:
            return {"success": False, "message": "No active subscription found to cancel."}

        if immediate:
            setattr(sub, "status", "canceled")
            setattr(sub, "canceled_at", utc_now())
            setattr(user, "plan", "free")
            setattr(user, "is_recruiter", False)
            db.commit()
            return {
                "success": True,
                "message": "Subscription cancelled immediately. Reverted to Free plan.",
                "plan": "free",
                "status": "canceled"
            }
        else:
            setattr(sub, "cancel_at_period_end", True)
            setattr(sub, "canceled_at", utc_now())
            db.commit()
            period_end = getattr(sub, "current_period_end", None)
            end_str = period_end.strftime("%B %d, %Y") if period_end else "the end of current billing cycle"
            return {
                "success": True,
                "message": f"Subscription will remain active until {end_str}, then cancel.",
                "plan": str(user.plan),
                "cancel_at_period_end": True
            }

    @staticmethod
    def simulate_payment_failure(
        user: User,
        provider: str,
        reason: str,
        db: Session
    ) -> Dict[str, Any]:
        """Record and handle failed payment event."""
        sub = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).order_by(Subscription.created_at.desc()).first()

        amount = 299.0 if str(user.plan) == "pro" else 1999.0

        # Mark subscription past_due
        if sub:
            setattr(sub, "status", "past_due")
            setattr(sub, "updated_at", utc_now())

        # Create failed payment record
        failed_pay = Payment(
            id=str(uuid.uuid4()),
            user_id=str(user.id),
            subscription_id=str(sub.id) if sub else None,
            provider=provider,
            provider_payment_id=f"failed_{uuid.uuid4().hex[:12]}",
            amount=amount,
            currency="INR",
            status="failed",
            payment_method="card",
            failure_reason=reason,
            created_at=utc_now()
        )
        db.add(failed_pay)

        # Create open/failed invoice
        inv_num = f"INV-FAILED-{uuid.uuid4().hex[:6].upper()}"
        failed_inv = Invoice(
            id=str(uuid.uuid4()),
            user_id=str(user.id),
            subscription_id=str(sub.id) if sub else None,
            invoice_number=inv_num,
            provider=provider,
            provider_invoice_id=f"in_failed_{uuid.uuid4().hex[:8]}",
            amount=amount,
            currency="INR",
            status="failed",
            plan_name=str(user.plan),
            paid_at=None,
            created_at=utc_now()
        )
        db.add(failed_inv)
        db.commit()

        return {
            "success": False,
            "status": "past_due",
            "failure_reason": reason,
            "invoice_number": inv_num,
            "message": f"Payment of ₹{amount:.0f} failed: {reason}. Subscription marked past due."
        }

    @staticmethod
    def simulate_trial_expiration(user: User, db: Session) -> Dict[str, Any]:
        """Simulate trial ending and reverting to Free."""
        sub = db.query(Subscription).filter(
            Subscription.user_id == user.id
        ).order_by(Subscription.created_at.desc()).first()

        if sub:
            setattr(sub, "status", "expired")
            setattr(sub, "trial_end", utc_now() - timedelta(minutes=1))
            setattr(sub, "updated_at", utc_now())

        setattr(user, "plan", "free")
        setattr(user, "is_recruiter", False)
        db.commit()

        return {
            "success": True,
            "plan": "free",
            "status": "expired",
            "message": "Trial period has concluded. Account has been safely reset to the Free tier."
        }
