"""
ResumeIQ AI — Automated Environment Management & Security Verification Suite
"""
import os
import sys

def test_environment_validation():
    print("[TEST 1/5] Testing valid configuration loading...")
    from app.core.config import Settings, validate_settings, ConfigurationError
    
    valid_cfg = Settings(
        GEMINI_API_KEY="test_gemini_key",
        DATABASE_URL="sqlite:///./test_validation.db",
        SECRET_KEY="test_secure_secret_key_1234567890",
        ENVIRONMENT="development"
    )
    validate_settings(valid_cfg)
    print("  -> PASSED: Valid configuration accepted.")

    print("\n[TEST 2/5] Testing startup failure on missing GEMINI_API_KEY...")
    missing_gemini_cfg = Settings(
        GEMINI_API_KEY="",
        DATABASE_URL="sqlite:///./test_validation.db",
        SECRET_KEY="test_secure_secret_key_1234567890",
        ENVIRONMENT="development"
    )
    try:
        validate_settings(missing_gemini_cfg)
        print("  -> FAILED: Expected ConfigurationError was not raised!")
        sys.exit(1)
    except ConfigurationError as e:
        assert "GEMINI_API_KEY" in str(e), "Error message should mention GEMINI_API_KEY"
        print("  -> PASSED: Successfully intercepted missing GEMINI_API_KEY.")
        print("     Captured message sample:\n    ", "\n     ".join(str(e).strip().splitlines()[:5]))

    print("\n[TEST 3/5] Testing startup failure on missing DATABASE_URL...")
    missing_db_cfg = Settings(
        GEMINI_API_KEY="test_key",
        DATABASE_URL="",
        SECRET_KEY="test_secure_secret_key_1234567890",
        ENVIRONMENT="development"
    )
    try:
        validate_settings(missing_db_cfg)
        print("  -> FAILED: Expected ConfigurationError was not raised!")
        sys.exit(1)
    except ConfigurationError as e:
        assert "DATABASE_URL" in str(e), "Error message should mention DATABASE_URL"
        print("  -> PASSED: Successfully intercepted missing DATABASE_URL.")

    print("\n[TEST 4/5] Testing production security guardrails (insecure SECRET_KEY rejection)...")
    insecure_prod_cfg = Settings(
        GEMINI_API_KEY="test_key",
        DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        SECRET_KEY="super-secret-development-key-resumeiq-ai-2026",
        ENVIRONMENT="production"
    )
    try:
        validate_settings(insecure_prod_cfg)
        print("  -> FAILED: Insecure production SECRET_KEY was not rejected!")
        sys.exit(1)
    except ConfigurationError as e:
        assert "CRITICAL SECURITY HAZARD" in str(e), "Error message should warn about default secret"
        print("  -> PASSED: Successfully blocked insecure default SECRET_KEY in production.")

    print("\n[TEST 5/5] Testing CORS and computed properties...")
    custom_cors_cfg = Settings(
        GEMINI_API_KEY="test_key",
        FRONTEND_URL="https://custom.resumeiq.ai",
        CORS_ORIGINS="https://app.resumeiq.ai,https://portal.resumeiq.ai",
        ENVIRONMENT="production"
    )
    origins = custom_cors_cfg.parsed_cors_origins
    assert "https://custom.resumeiq.ai" in origins
    assert "https://app.resumeiq.ai" in origins
    assert "https://portal.resumeiq.ai" in origins
    print("  -> PASSED: CORS origins correctly parsed & merged:", origins)

    print("\n========================================================")
    print("ALL 5/5 ENVIRONMENT MANAGEMENT VERIFICATION TESTS PASSED!")
    print("========================================================")

if __name__ == "__main__":
    test_environment_validation()
