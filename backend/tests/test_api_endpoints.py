import io
import pytest
from fastapi.testclient import TestClient

class TestAPIEndpoints:
    def test_root_endpoint(self, client: TestClient):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "ResumeIQ" in data["app"]

    def test_health_check(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_upload_resume_unsupported_file_extension(self, client: TestClient):
        # Authenticate first
        auth_res = client.post("/api/auth/demo-login")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        file_payload = ("malicious.exe", io.BytesIO(b"MZ\x90\x00BinaryExeContent"), "application/octet-stream")
        response = client.post(
            "/api/resumes/upload",
            files={"file": file_payload},
            headers=headers
        )
        assert response.status_code == 400
        assert "Unsupported file format" in response.json()["detail"]

    def test_upload_resume_valid_text(self, client: TestClient, synthetic_resume_text):
        auth_res = client.post("/api/auth/demo-login")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        file_payload = ("sample_resume.txt", io.BytesIO(synthetic_resume_text.encode("utf-8")), "text/plain")
        response = client.post(
            "/api/resumes/upload",
            files={"file": file_payload},
            data={"title": "Test Engineer Resume"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Engineer Resume"
        assert "id" in data

    def test_get_nonexistent_resume(self, client: TestClient):
        auth_res = client.post("/api/auth/demo-login")
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/resumes/00000000-0000-0000-0000-000000000000", headers=headers)
        assert response.status_code == 404

    def test_get_nonexistent_analysis(self, client: TestClient):
        response = client.get("/api/analysis/nonexistent-analysis-id")
        assert response.status_code == 404

    def test_recruiter_status_endpoint(self, client: TestClient):
        response = client.get("/api/recruiter/status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
