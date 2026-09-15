import subprocess
import json
import os
from typing import Optional, Dict, Any, List

class DBVerifier:
    CONTAINER = "tuyendung-studio-backend"

    @classmethod
    def run_django_code(cls, py_code: str) -> Dict[str, Any]:
        """Runs a python snippet inside the Django backend container via python manage.py shell."""
        cmd = [
            "docker", "exec", "-e", "PYTHONIOENCODING=utf-8", cls.CONTAINER,
            "python", "manage.py", "shell", "-c", py_code
        ]
        try:
            env = os.environ.copy()
            env["PYTHONIOENCODING"] = "utf-8"
            result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env, timeout=15)
            if result.returncode != 0:
                return {"success": False, "error": result.stderr}
            return {"success": True, "output": result.stdout.strip()}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @classmethod
    def _parse_last_json(cls, output: str) -> Optional[Dict[str, Any]]:
        for line in reversed(output.splitlines()):
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    return json.loads(line)
                except Exception:
                    continue
        return None

    @classmethod
    def verify_job_post(cls, job_name: str) -> Dict[str, Any]:
        """Finds the latest job post matching job_name and returns status and metadata."""
        # Sanitize job_name for inline python string
        clean_name = job_name.replace('"', '\\"')
        code = f"""
import json
from apps.jobs.models import JobPost
j = JobPost.objects.filter(job_name__icontains="{clean_name}").order_by('-id').first()
if j:
    print(json.dumps({{
        'found': True,
        'id': j.id,
        'job_name': j.job_name,
        'status': j.status,
        'salary_min': j.salary_min,
        'salary_max': j.salary_max,
        'user_id': j.user_id,
        'company_id': j.company_id
    }}))
else:
    print(json.dumps({{'found': False}}))
"""
        res = cls.run_django_code(code)
        if res["success"]:
            data = cls._parse_last_json(res["output"])
            if data:
                return data
        return {"found": False, "error": res.get("error", "Failed to parse json")}

    @classmethod
    def approve_job_post_in_db(cls, job_id: int) -> Dict[str, Any]:
        """Sets JobPost.status = 3 (APPROVED) directly if needed or to assert sync."""
        code = f"""
import json
from apps.jobs.models import JobPost
from shared.configs import variable_system as var_sys
try:
    j = JobPost.objects.get(id={job_id})
    j.status = var_sys.JobPostStatus.APPROVED
    j.save(update_fields=['status'])
    print(json.dumps({{'success': True, 'id': j.id, 'status': j.status}}))
except Exception as e:
    print(json.dumps({{'success': False, 'error': str(e)}}))
"""
        res = cls.run_django_code(code)
        if res["success"]:
            data = cls._parse_last_json(res["output"])
            if data:
                return data
        return {"success": False, "error": res.get("error", "")}

    @classmethod
    def verify_application(cls, job_id: int, user_email: str) -> Dict[str, Any]:
        """Verifies if user_email applied to job_id."""
        code = f"""
import json
from apps.jobs.models import JobPostActivity
from apps.accounts.models import User
u = User.objects.filter(email="{user_email}").first()
if not u:
    print(json.dumps({{'found': False, 'reason': 'User not found'}}))
else:
    act = JobPostActivity.objects.filter(job_post_id={job_id}, user=u).order_by('-id').first()
    if act:
        print(json.dumps({{
            'found': True,
            'id': act.id,
            'status': act.status,
            'full_name': act.full_name,
            'email': act.email,
            'has_resume': bool(act.resume_id)
        }}))
    else:
        print(json.dumps({{'found': False, 'reason': 'No activity found'}}))
"""
        res = cls.run_django_code(code)
        if res["success"]:
            data = cls._parse_last_json(res["output"])
            if data:
                return data
        return {"found": False, "error": res.get("error", "")}
