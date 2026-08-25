#!/usr/bin/env python
"""
MASTER LIVE TEST RUNNER FOR ALL SYSTEM FLOWS
Runs every single live test suite sequentially against real DB, real API endpoints, real multipart data:
1. CV Upload & Persistence Lifecycle (test_cv_upload_lifecycle_live.py)
2. Candidate Full Lifecycle (test_candidate_lifecycle_live.py)
3. Employer Full ATS & Recruitment Lifecycle (test_employer_lifecycle_live.py)
4. New Platform Features Suite: iCal, AI Proctoring, Offer Letter, VN Payroll (test_new_features_suite.py)
5. Native HRM & AI Chatbot Live Suite (test_platform_hrm_chatbot_live.py)
6. Deep Anomaly & Fuzzing Pentest Suite (test_deep_anomaly_fuzzing.py)
7. Hardcore Adversarial & Multi-Tenancy RBAC Audit (test_hardcore_adversarial_audit.py)
8. Privacy & Agent Sandbox Audit (test_advanced_agent_and_privacy_audit.py)
"""
import os
import sys
import time
import subprocess

# Configure UTF-8 encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPTS_DIR)

TEST_SUITES = [
    {
        "name": "1. Luồng Tải & Lưu Trữ CV Nhị Phân (CV Upload & Persistence Lifecycle)",
        "file": "test_cv_upload_lifecycle_live.py",
        "description": "Upload PDF multipart, F5 reload, đổi tên tiêu đề, xóa CV, bảo toàn DB"
    },
    {
        "name": "2. Luồng Vòng Đời Toàn Diện Của Ứng Viên (Candidate Full Lifecycle)",
        "file": "test_candidate_lifecycle_live.py",
        "description": "Đăng ký, tạo CV online, nộp đơn, AI chấm điểm, phỏng vấn LiveKit, onboard HRM"
    },
    {
        "name": "3. Luồng Vòng Đời Tuyển Dụng Của NTD & ATS (Employer ATS Lifecycle)",
        "file": "test_employer_lifecycle_live.py",
        "description": "Tạo cty, đăng tin, lọc ứng viên, pipeline ATS, tạo nhân viên HRM, phân quyền"
    },
    {
        "name": "4. Luồng 4 Phân Hệ Mới: iCal, AI Proctoring, Offer Letter, VN Payroll",
        "file": "test_new_features_suite.py",
        "description": "iCalendar RFC 5545, AI giám sát phỏng vấn, Job Offer ký điện tử, tính thuế TNCN 7 bậc"
    },
    {
        "name": "5. Luồng Quản Trị Native HRM & AI Chatbot (HRM & Chatbot Suite)",
        "file": "test_platform_hrm_chatbot_live.py",
        "description": "Phòng ban, chức vụ, hợp đồng, bảng lương, AI Chatbot tư vấn"
    },
    {
        "name": "6. Luồng Kiểm Thử Dữ Liệu Dị Biệt & Fuzzing (Deep Anomaly & Fuzzing)",
        "file": "test_deep_anomaly_fuzzing.py",
        "description": "Fuzzing phân trang, SQLi/XSS, Emojis 4-byte, Type confusion, IDOR, logic biên"
    },
    {
        "name": "7. Luồng Kiểm Thử Xâm Nhập & Cô Lập Đa Doanh Nghiệp (Adversarial RBAC)",
        "file": "test_hardcore_adversarial_audit.py",
        "description": "Cô lập multi-tenancy, chặn can thiệp chéo cty, chống leo thang đặc quyền"
    },
    {
        "name": "8. Luồng Quyền Riêng Tư & Hộp Cát AI Agent (Privacy & Sandbox)",
        "file": "test_advanced_agent_and_privacy_audit.py",
        "description": "Bảo vệ thông tin cá nhân (PII), sandbox giới hạn quyền AI Agent"
    }
]


def run_master_suite():
    print("=" * 80, flush=True)
    print("🌟 BẮT ĐẦU CHẠY TOÀN BỘ 8 BỘ TEST TỔNG HỢP (MASTER TEST RUNNER)", flush=True)
    print("=" * 80, flush=True)
    
    total_start = time.time()
    results = []
    
    for idx, suite in enumerate(TEST_SUITES, 1):
        script_path = os.path.join(SCRIPTS_DIR, suite["file"])
        print(f"\n[{idx}/{len(TEST_SUITES)}] ĐANG CHẠY: {suite['name']}", flush=True)
        print(f"  Mô tả: {suite['description']}", flush=True)
        print(f"  Tệp: {suite['file']}", flush=True)
        print("-" * 70, flush=True)
        
        start_time = time.time()
        process = subprocess.Popen(
            [sys.executable, "-u", script_path],
            cwd=BASE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1
        )
        
        output_lines = []
        for line in process.stdout:
            sys.stdout.write("    " + line)
            sys.stdout.flush()
            output_lines.append(line)
            
        process.wait()
        duration = time.time() - start_time
        passed = (process.returncode == 0)
        
        results.append({
            "name": suite["name"],
            "file": suite["file"],
            "passed": passed,
            "duration": duration,
            "returncode": process.returncode
        })
        
        if passed:
            print(f"  >>> ✅ KẾT QUẢ: PASS (Thời gian: {duration:.2f}s, Exit Code: 0)", flush=True)
        else:
            print(f"  >>> ❌ KẾT QUẢ: FAILED (Thời gian: {duration:.2f}s, Exit Code: {process.returncode})", flush=True)

    total_duration = time.time() - total_start
    all_passed = all(r["passed"] for r in results)
    
    print("\n" + "=" * 80, flush=True)
    print("📊 BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN BỘ CÁC LUỒNG HỆ THỐNG", flush=True)
    print("=" * 80, flush=True)
    print(f"{'STT':<4} | {'Tên Bộ Kiểm Thử':<50} | {'Thời gian':<10} | {'Trạng thái'}", flush=True)
    print("-" * 80, flush=True)
    for idx, r in enumerate(results, 1):
        status_str = "✅ PASS" if r["passed"] else "❌ FAIL"
        print(f"{idx:<4} | {r['name'][:48]:<50} | {r['duration']:>7.2f}s  | {status_str}", flush=True)
    print("-" * 80, flush=True)
    print(f"Tổng thời gian: {total_duration:.2f}s | Kết quả chung: {'🎉 100% PASS' if all_passed else '⚠️ CÓ LỖI'}", flush=True)
    print("=" * 80, flush=True)
    
    if not all_passed:
        sys.exit(1)


if __name__ == "__main__":
    run_master_suite()
