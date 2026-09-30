import io
import pytest
from rest_framework import serializers
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.profiles.serializers_pkg.resume_serializers import validate_pdf_cv_file


class TestPdfCvSecurity:
    def test_valid_pdf_with_magic_bytes_passes(self):
        valid_pdf_content = b"%PDF-1.4\n%mock valid pdf content"
        uploaded = SimpleUploadedFile("my_resume.pdf", valid_pdf_content, content_type="application/pdf")
        result = validate_pdf_cv_file(uploaded)
        assert result == uploaded

    def test_spoofed_pdf_without_magic_bytes_rejected(self):
        fake_content = b"<script>alert('xss')</script>"
        uploaded = SimpleUploadedFile("my_resume.pdf", fake_content, content_type="application/pdf")
        with pytest.raises(serializers.ValidationError) as exc:
            validate_pdf_cv_file(uploaded)
        assert "magic header" in str(exc.value)

    def test_path_traversal_filename_rejected(self):
        class MockFile:
            name = "../../../etc/passwd.pdf"
            content_type = "application/pdf"
            size = 100

        with pytest.raises(serializers.ValidationError) as exc:
            validate_pdf_cv_file(MockFile())
        assert "Tên tệp tin không hợp lệ" in str(exc.value)

    def test_non_pdf_extension_rejected(self):
        content = b"%PDF-1.4\n%content"
        uploaded = SimpleUploadedFile("payload.exe", content, content_type="application/pdf")
        with pytest.raises(serializers.ValidationError) as exc:
            validate_pdf_cv_file(uploaded)
        assert "Only PDF files are accepted" in str(exc.value)
