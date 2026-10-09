"""
ResumeIQ AI — Centralized Environment Configuration & Validation Module
========================================================================
Provides type-safe configuration loading, runtime environment parsing,
and strict startup validation for production readiness.
"""

import os
import sys
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# 1. Automatic .env Discovery and Loading
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv

    # Search hierarchy:
    # 1. Current working directory .env
    # 2. backend/.env
    # 3. Project root .env
    # 4. .env.local
    current_dir = Path.cwd()
    backend_dir = Path(__file__).resolve().parent.parent.parent
    root_dir = backend_dir.parent

    candidate_env_files = [
        current_dir / ".env",
        backend_dir / ".env",
        root_dir / ".env",
        current_dir / ".env.local",
        backend_dir / ".env.local",
        root_dir / ".env.local",
    ]

    for env_path in candidate_env_files:
        if env_path.is_file():
            load_dotenv(dotenv_path=env_path, override=False)
except ImportError:
    pass


# ---------------------------------------------------------------------------
# 2. Configuration Exception
# ---------------------------------------------------------------------------
class ConfigurationError(RuntimeError):
    """Raised when critical required environment variables are missing or malformed."""
    pass


# ---------------------------------------------------------------------------
# 3. Type-Safe Settings Model (Pydantic v2)
# ---------------------------------------------------------------------------
class Settings(BaseModel):
    # Core Application & Server
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ResumeIQ AI — AI-Powered ATS Resume Analyzer")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    ENABLE_RECRUITER_DASHBOARD: bool = os.getenv("ENABLE_RECRUITER_DASHBOARD", "true").lower() in ("true", "1", "yes")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resumeiq.db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_ECHO: bool = os.getenv("DB_ECHO", "false").lower() in ("true", "1", "yes")

    # Authentication & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-development-key-resumeiq-ai-2026")
    JWT_SECRET: Optional[str] = os.getenv("JWT_SECRET", None)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    ENCRYPTION_KEY: Optional[str] = os.getenv("ENCRYPTION_KEY", None)
    NEXTAUTH_SECRET: Optional[str] = os.getenv("NEXTAUTH_SECRET", None)
    NEXTAUTH_URL: Optional[str] = os.getenv("NEXTAUTH_URL", None)
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", None)
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET", None)
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))


    # AI Integration (Google Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Subscription Billing (Stripe & Razorpay)
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock_stripe_key_resumeiq")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_mock_stripe_key_resumeiq")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock_stripe_secret")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock_key_resumeiq")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mock_razorpay_secret_resumeiq")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_razorpay_webhook_secret")

    # Supabase (Database, Auth & Storage)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", None)
    SUPABASE_BUCKET_NAME: str = os.getenv("SUPABASE_BUCKET_NAME", "resumes")

    # Storage & Uploads
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))

    # Analytics
    POSTHOG_API_KEY: Optional[str] = os.getenv("POSTHOG_API_KEY", None)
    POSTHOG_HOST: str = os.getenv("POSTHOG_HOST", "https://us.i.posthog.com")
    GA_MEASUREMENT_ID: Optional[str] = os.getenv("GA_MEASUREMENT_ID", None)
    NEXT_PUBLIC_GA_ID: Optional[str] = os.getenv("NEXT_PUBLIC_GA_ID", None)

    # Monitoring & Error Tracking
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN", None)
    SENTRY_ENVIRONMENT: Optional[str] = os.getenv("SENTRY_ENVIRONMENT", None)
    SENTRY_TRACES_SAMPLE_RATE: float = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1"))

    # Transactional Email (SMTP & Resend)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", None)
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", None)
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY", None)
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "ResumeIQ AI <noreply@resumeiq.ai>")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_SSL: bool = os.getenv("SMTP_SSL", "false").lower() in ("true", "1", "yes")


    # Frontend API
    NEXT_PUBLIC_API_URL: str = os.getenv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:8000/api")
    NEXT_PUBLIC_SITE_URL: str = os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")

    @property
    def effective_jwt_secret(self) -> str:
        """Returns JWT_SECRET if defined, otherwise falls back to SECRET_KEY."""
        return self.JWT_SECRET or self.SECRET_KEY

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in ("development", "dev", "test")

    @property
    def parsed_cors_origins(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins


# ---------------------------------------------------------------------------
# 4. Startup Validation Engine
# ---------------------------------------------------------------------------
def validate_settings(cfg: Settings) -> None:
    """
    Validates environment settings on application startup.
    Fails fast and prints clean actionable guidance if required variables are missing.
    """
    if os.getenv("SKIP_ENV_VALIDATION", "").lower() in ("true", "1"):
        return

    missing_variables: List[str] = []

    # 1. GEMINI_API_KEY Check
    if not cfg.GEMINI_API_KEY or not cfg.GEMINI_API_KEY.strip():
        missing_variables.append("GEMINI_API_KEY")

    # 2. Database Connection Check
    if not cfg.DATABASE_URL or not cfg.DATABASE_URL.strip():
        missing_variables.append("DATABASE_URL")

    # 3. Authentication Secret Check
    if not cfg.SECRET_KEY or not cfg.SECRET_KEY.strip():
        missing_variables.append("SECRET_KEY")

    # Production-Specific Strict Checks
    if cfg.is_production:
        if cfg.SECRET_KEY in (
            "super-secret-development-key-resumeiq-ai-2026",
            "super-secret-development-key-change-in-production-resumeiq-ai",
            "default_secret",
            "secret",
        ):
            raise ConfigurationError(
                "CRITICAL SECURITY HAZARD: Default development SECRET_KEY detected in production!\n"
                "Generate a cryptographically secure 256-bit key using: openssl rand -hex 32\n"
                "Assign it to SECRET_KEY / JWT_SECRET in your production environment."
            )

        if cfg.DATABASE_URL.startswith("sqlite:///"):
            print(
                "WARNING [Production Database]: SQLite is configured in production mode. "
                "For high-concurrency production deployments, PostgreSQL (Supabase/Neon) is recommended.",
                file=sys.stderr,
            )

    # Fail fast if any required variables are missing
    if missing_variables:
        error_msg = (
            "\n"
            + "=" * 70 + "\n"
            + "ENVIRONMENT CONFIGURATION ERROR: APPLICATION STARTUP HALTED\n"
            + "=" * 70 + "\n"
            + f"Missing required environment variable:\n"
            + "\n".join(f"- {var}" for var in missing_variables) + "\n\n"
            + "RESOLUTION STEPS:\n"
            + "1. Copy backend/.env.example to backend/.env (or root .env)\n"
            + "2. Provide valid values for all required variables listed above.\n"
            + "3. Refer to SETUP_ENVIRONMENT.md for full guidance on obtaining keys.\n"
            + "=" * 70
        )
        raise ConfigurationError(error_msg)


# ---------------------------------------------------------------------------
# 5. Global Settings Instance Initialization
# ---------------------------------------------------------------------------
settings = Settings()

# Ensure local upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)

# Run startup validation check
validate_settings(settings)
