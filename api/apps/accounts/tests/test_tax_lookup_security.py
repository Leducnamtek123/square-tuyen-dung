import pytest
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import MagicMock
from apps.accounts.views_onboarding import TaxLookupView
from apps.accounts.models import User


@pytest.mark.django_db
class TestTaxLookupSecurity:
    def setup_method(self):
        self.factory = APIRequestFactory()
        self.view = TaxLookupView.as_view()
        self.user = User.objects.create_user(
            email="test_tax_sec@example.com",
            full_name="Test Security User",
            password="testpassword123"
        )

    def test_tax_lookup_rejects_empty_tax_code(self):
        request = self.factory.get("/api/accounts/onboarding/tax-lookup/?tax_code=")
        force_authenticate(request, user=self.user)
        response = self.view(request)
        assert response.status_code == 400
        assert "Vui lòng cung cấp mã số thuế" in response.data.get("message", "")

    def test_tax_lookup_rejects_ssrf_and_injection_payloads(self):
        malicious_inputs = [
            "../../../etc/passwd",
            "0123456789; DROP TABLE users;",
            "<script>alert(1)</script>",
            "http://169.254.169.254/latest/meta-data/",
            "0123456789\r\nHost: evil.com",
            "12345",  # Too short
            "123456789012345",  # Too long
            "0101234567-abc",  # Non-digit suffix
        ]
        for payload in malicious_inputs:
            request = self.factory.get(f"/api/accounts/onboarding/tax-lookup/?tax_code={payload}")
            force_authenticate(request, user=self.user)
            response = self.view(request)
            assert response.status_code == 400
            assert "không đúng định dạng" in response.data.get("message", "")

    def test_tax_lookup_accepts_valid_10_and_13_digit_tax_codes(self, monkeypatch):
        # Mock requests.get so no real external network call is made in tests
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "code": "00",
            "data": {
                "name": "CONG TY TNHH TEST",
                "address": "Ha Noi, Viet Nam",
            }
        }
        monkeypatch.setattr("requests.get", lambda *args, **kwargs: mock_resp)

        # 10 digits
        request = self.factory.get("/api/accounts/onboarding/tax-lookup/?tax_code=0101234567")
        force_authenticate(request, user=self.user)
        response = self.view(request)
        assert response.status_code == 200
        assert response.data["exists"] is False
        assert response.data["company"]["companyName"] == "CONG TY TNHH TEST"

        # 13 digits (10 digits - 3 digits)
        request = self.factory.get("/api/accounts/onboarding/tax-lookup/?tax_code=0101234567-001")
        force_authenticate(request, user=self.user)
        response = self.view(request)
        assert response.status_code == 200
        assert response.data["exists"] is False
