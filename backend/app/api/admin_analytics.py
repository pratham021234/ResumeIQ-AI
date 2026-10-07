from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.api.deps import get_db, get_current_user_optional
from app.models.models import User
from app.schemas.schemas import AnalyticsEventCreate
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Product Analytics & Admin Metrics"])

@router.post("/event")
def record_event(
    event_data: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Ingest product analytics event from web application.
    Complies with GDPR & CCPA: IPs are pseudonymized using SHA-256 and no sensitive PII is stored.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user_id = str(current_user.id) if current_user else None

    event = AnalyticsService.log_event(
        event_name=event_data.event_name,
        category=event_data.category or "engagement",
        user_id=user_id,
        anonymous_id=event_data.anonymous_id,
        session_id=event_data.session_id,
        properties=event_data.properties or {},
        url=event_data.url or "/",
        referrer=event_data.referrer,
        ip=client_ip,
        user_agent=user_agent,
        db=db
    )

    return {
        "success": True,
        "event_id": str(event.id),
        "event_name": event.event_name,
        "source": event.source
    }

@router.get("/admin/overview")
def get_admin_analytics_overview(
    days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Fetch comprehensive SaaS admin analytics:
    - Revenue metrics (MRR, ARR, Churn rate)
    - Acquisition & traffic sources breakdown
    - Activation & signup charts
    - 5-step conversion funnel
    - Top landing pages with bounce & conversion rates
    """
    metrics = AnalyticsService.get_admin_metrics(db=db, days=days)
    return metrics

@router.post("/admin/seed")
def seed_analytics_data(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Manually populate or refresh realistic historical analytics data."""
    AnalyticsService.seed_historical_analytics_if_needed(db)
    return {"success": True, "message": "Analytics database successfully synchronized."}
