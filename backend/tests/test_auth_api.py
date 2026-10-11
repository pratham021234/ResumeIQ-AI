import pytest
from fastapi.testclient import TestClient

class TestAuthenticationAPI:
    def test_user_signup_success(self, client: TestClient):
        payload = {
            "email": "test.engineer@example.com",
            "password": "ValidStrongPassword123!",
            "full_name": "Test Engineer"
        }
        response = client.post("/api/auth/signup", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test.engineer@example.com"
        assert data["user"]["full_name"] == "Test Engineer"
        
        # Verify sensitive password fields are never exposed
        assert "password" not in data["user"]
        assert "hashed_password" not in data["user"]

    def test_duplicate_signup_rejected(self, client: TestClient):
        payload = {
            "email": "duplicate.user@example.com",
            "password": "ValidStrongPassword123!",
            "full_name": "Duplicate User"
        }
        res1 = client.post("/api/auth/signup", json=payload)
        assert res1.status_code == 200
        
        # Second attempt must return 400 Bad Request
        res2 = client.post("/api/auth/signup", json=payload)
        assert res2.status_code == 400
        assert "already exists" in res2.json()["detail"]

    def test_login_valid_credentials(self, client: TestClient):
        email = "login.test@example.com"
        password = "SecurePassword123!"
        client.post("/api/auth/signup", json={"email": email, "password": password, "full_name": "Login User"})
        
        login_res = client.post("/api/auth/login", json={"email": email, "password": password})
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == email

    def test_login_invalid_password(self, client: TestClient):
        email = "wrongpw.test@example.com"
        password = "CorrectPassword123!"
        client.post("/api/auth/signup", json={"email": email, "password": password})
        
        bad_login = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword999!"})
        assert bad_login.status_code == 401
        assert "Incorrect" in bad_login.json()["detail"]
        assert "password" not in str(bad_login.json()) or "detail" in bad_login.json()

    def test_login_nonexistent_user(self, client: TestClient):
        bad_login = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "AnyPassword!"})
        assert bad_login.status_code == 401
        assert "Incorrect" in bad_login.json()["detail"]

    def test_demo_login_endpoint(self, client: TestClient):
        res = client.post("/api/auth/demo-login")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "demo@resumeiq.ai"

    def test_protected_me_endpoint_requires_auth(self, client: TestClient):
        # Without Authorization header
        res_no_auth = client.get("/api/auth/me")
        assert res_no_auth.status_code == 401

        # With invalid/malformed token
        res_bad_token = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
        assert res_bad_token.status_code == 401

    def test_protected_me_endpoint_with_valid_token(self, client: TestClient):
        signup_res = client.post("/api/auth/signup", json={
            "email": "me.test@example.com",
            "password": "MySecretPassword123!",
            "full_name": "Profile Owner"
        })
        token = signup_res.json()["access_token"]
        
        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        user_data = me_res.json()
        assert user_data["email"] == "me.test@example.com"
        assert user_data["full_name"] == "Profile Owner"

    def test_recruiter_demo_login(self, client: TestClient):
        res = client.post("/api/recruiter/auth/demo-login")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "recruiter@resumeiq.ai"
        assert data["user"]["is_recruiter"] is True
