# Vieclam24h Candidate Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only import flow that pulls candidate resumes from Vieclam24h into the shared resume pool, and add a safe cleanup command that removes seeded candidate data while keeping only admin and `ceohub.hostmaster@gmail.com`.

**Architecture:** Reuse the existing `Resume` model as the shared candidate pool so recruiter search keeps working through the current resume endpoints and filters. Add source metadata to `Resume` so imported candidates can be traced back to Vieclam24h, then implement a backend import service/command that logs in with the provided source account, extracts candidate rows, maps them into the four active industries, and stores them as resumes with synthetic job seeker profiles when needed. Keep the UI change thin: an admin button beside `Hồ sơ cá nhân` opens a modal that posts the source URL, account, and password to the backend.

**Tech Stack:** Django, Django REST Framework, React, MUI, React Query, requests, BeautifulSoup, pytest, Jest.

---

### Task 1: Clean seeded accounts and candidate data safely

**Files:**
- Modify: `api/apps/accounts/management/commands/clear_square_demo_data.py`
- Modify: `api/apps/accounts/management/commands/seed_data.py`
- Modify: `api/apps/accounts/management/commands/seed_users.py`
- Test: `api/apps/accounts/tests/test_clear_square_demo_data.py`

- [ ] **Step 1: Write the failing test**

```python
def test_clear_square_demo_data_keeps_only_admin_and_ceohost(db):
    call_command("clear_square_demo_data", keep_emails=["ceohub.hostmaster@gmail.com"])
    assert User.objects.filter(is_superuser=True).exists()
    assert User.objects.filter(email="ceohub.hostmaster@gmail.com").exists()
    assert not User.objects.filter(email="candidate2@project.com").exists()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/accounts/tests/test_clear_square_demo_data.py -v`

Expected: FAIL because the command does not yet preserve/clear exactly the requested accounts.

- [ ] **Step 3: Write minimal implementation**

```python
def handle(self, *args, **options):
    keep_emails = set(options.get("keep_emails") or [])
    keep_user_ids = set(User.objects.filter(is_superuser=True).values_list("id", flat=True))
    keep_user_ids.update(User.objects.filter(email__in=keep_emails).values_list("id", flat=True))

    Resume.objects.exclude(user_id__in=keep_user_ids).delete()
    JobSeekerProfile.objects.exclude(user_id__in=keep_user_ids).delete()
    User.objects.exclude(id__in=keep_user_ids).delete()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/accounts/tests/test_clear_square_demo_data.py -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/accounts/management/commands/clear_square_demo_data.py api/apps/accounts/management/commands/seed_data.py api/apps/accounts/management/commands/seed_users.py api/apps/accounts/tests/test_clear_square_demo_data.py
git commit -m "chore: clean seeded candidate data"
```

### Task 2: Add shared resume source metadata and import backend

**Files:**
- Modify: `api/apps/profiles/models.py`
- Modify: `api/apps/profiles/serializers_pkg/resume_serializers.py`
- Modify: `api/apps/profiles/views/web_admin.py`
- Modify: `api/apps/profiles/urls.py`
- Add: `api/apps/profiles/services/vieclam24h_import.py`
- Add: `api/apps/profiles/management/commands/import_vieclam24h_candidates.py`
- Add: `api/apps/profiles/tests/test_vieclam24h_import.py`
- Add migration: `api/apps/profiles/migrations/0009_resume_source_metadata.py`

- [ ] **Step 1: Write the failing test**

```python
def test_import_service_maps_source_candidates_into_resumes(db, mocker):
    mocker.patch("apps.profiles.services.vieclam24h_import.fetch_candidate_rows", return_value=[{
        "full_name": "Nguyen Van A",
        "email": "a@example.com",
        "phone": "0909000111",
        "title": "Backend Developer",
        "career_name": "Công nghệ thông tin",
    }])
    result = import_vieclam24h_candidates("https://example.com", "user", "pass", career_names=["Công nghệ thông tin"])
    assert result.created_count == 1
    assert Resume.objects.filter(source_platform="vieclam24h", user__email="a@example.com").exists()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests/test_vieclam24h_import.py -v`

Expected: FAIL because `Resume.source_platform` and the import service do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```python
class Resume(CommonBaseModel):
    source_platform = models.CharField(max_length=50, blank=True, null=True)
    source_url = models.URLField(blank=True, null=True)
    source_account = models.CharField(max_length=255, blank=True, null=True)
    source_ref = models.CharField(max_length=255, blank=True, null=True)
    source_payload = models.JSONField(blank=True, null=True)
    is_imported = models.BooleanField(default=False, db_index=True)
```

```python
def import_vieclam24h_candidates(source_url, username, password, career_names):
    session = login(source_url, username, password)
    rows = fetch_candidate_rows(session, source_url)
    return persist_candidate_rows(rows, career_names)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/profiles/tests/test_vieclam24h_import.py -v`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/models.py api/apps/profiles/serializers_pkg/resume_serializers.py api/apps/profiles/views/web_admin.py api/apps/profiles/urls.py api/apps/profiles/services/vieclam24h_import.py api/apps/profiles/management/commands/import_vieclam24h_candidates.py api/apps/profiles/tests/test_vieclam24h_import.py api/apps/profiles/migrations/0009_resume_source_metadata.py
git commit -m "feat: import vieclam24h candidates into resumes"
```

### Task 3: Add admin import button and modal

**Files:**
- Modify: `frontend/src/views/adminPages/ProfilesPage/index.tsx`
- Modify: `frontend/src/views/adminPages/ProfilesPage/hooks/useProfiles.ts`
- Modify: `frontend/src/services/adminManagementService.ts`
- Modify: `frontend/src/types/models.ts`
- Add: `frontend/src/views/adminPages/ProfilesPage/__tests__/ProfilesPageImport.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("opens the import modal from the profile page header", async () => {
  render(<ProfilesPage />);
  await user.click(screen.getByRole("button", { name: /lấy ứng viên/i }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --runInBand src/views/adminPages/ProfilesPage/__tests__/ProfilesPageImport.test.tsx`

Expected: FAIL because the button/modal do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
<Button startIcon={<DownloadIcon />} onClick={() => setOpenImportDialog(true)}>
  Lấy ứng viên
</Button>
```

```tsx
<Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
  <TextField label="Link tuyển dụng" />
  <TextField label="Tài khoản" />
  <TextField label="Mật khẩu" type="password" />
</Dialog>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --runInBand src/views/adminPages/ProfilesPage/__tests__/ProfilesPageImport.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/adminPages/ProfilesPage/index.tsx frontend/src/views/adminPages/ProfilesPage/hooks/useProfiles.ts frontend/src/services/adminManagementService.ts frontend/src/types/models.ts frontend/src/views/adminPages/ProfilesPage/__tests__/ProfilesPageImport.test.tsx
git commit -m "feat: add admin candidate import modal"
```

### Task 4: Verify recruiter search still works on imported resumes

**Files:**
- Modify: `frontend/src/views/components/employers/ProfileSearch/index.tsx` if filter labels need a small adjustment
- Modify: `frontend/src/views/components/employers/hooks/useEmployerQueries.ts` only if the resume query needs a new filter param
- Test: existing employer resume search tests

- [ ] **Step 1: Write the failing test**

```tsx
it("keeps career filters wired to the shared resume list", async () => {
  expect(normalizeJobPostOptions([{ id: 1, jobName: "Công nghệ thông tin" }])).toEqual([
    { id: 1, jobName: "Công nghệ thông tin" }
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --runInBand src/views/components/employers/__tests__/CandidateSearch.test.tsx`

Expected: FAIL until the test is aligned to the current shared resume query shape.

- [ ] **Step 3: Write minimal implementation**

No new search backend is needed if imported resumes populate `career`, `city`, `experience`, and `is_active` consistently.

- [ ] **Step 4: Run test to verify it passes**

Run the employer search and admin import tests together.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/components/employers/ProfileSearch/index.tsx frontend/src/views/components/employers/hooks/useEmployerQueries.ts
git commit -m "chore: keep recruiter search aligned with imported resumes"
```

### Self-check

- [ ] No task uses placeholder-only instructions.
- [ ] Every code change has a corresponding test-first step.
- [ ] The shared resume pool stays compatible with current recruiter search.
- [ ] Cleanup keeps only admin and `ceohub.hostmaster@gmail.com` seed accounts.
