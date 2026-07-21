# Vieclam24h Import Minimal Destination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the Vieclam24h import flow so admins only choose source URL, account, password, and source occupations, while the backend accepts imports without destination city or district.

**Architecture:** Keep the import pipeline intact and make destination location optional end-to-end. The frontend modal should stop asking for city/district and send only the source metadata plus selected occupations. The backend serializer should treat destination city/district as optional so existing candidate location fallback logic can resolve storage automatically.

**Tech Stack:** Django, Django REST Framework, React, MUI, React Query, pytest, Jest, Docker Compose.

---

### Task 1: Make backend import destination optional

**Files:**
- Modify: `api/apps/profiles/views/web_admin.py`
- Modify: `api/apps/profiles/tests/test_admin_resume_import.py`

- [ ] **Step 1: Write the failing test**

```python
def test_admin_resume_import_endpoint_accepts_missing_destination_fields(monkeypatch, admin_user):
    called = {}

    def fake_import_vieclam24h_candidates(*, source_url, username, password, occupation_ids, career_names, target_city, target_district, created_by):
        called["source_url"] = source_url
        called["username"] = username
        called["password"] = password
        called["occupation_ids"] = list(occupation_ids or [])
        called["target_city"] = target_city
        called["target_district"] = target_district

        class Result:
            created_count = 1
            updated_count = 0
            skipped_count = 0

        return Result()

    monkeypatch.setattr("apps.profiles.views.web_admin.import_vieclam24h_candidates", fake_import_vieclam24h_candidates)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest api/apps/profiles/tests/test_admin_resume_import.py::test_admin_resume_import_endpoint_accepts_missing_destination_fields -v`
Expected: FAIL because `destinationCityId` and `destinationDistrictId` are still required.

- [ ] **Step 3: Write minimal implementation**

```python
class Vieclam24hImportSerializer(serializers.Serializer):
    sourceUrl = serializers.URLField()
    account = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
    occupationIds = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    destinationCityId = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    destinationDistrictId = serializers.IntegerField(min_value=1, required=False, allow_null=True)

    def validate(self, attrs):
        city_id = attrs.get("destinationCityId")
        district_id = attrs.get("destinationDistrictId")
        if city_id is None or district_id is None:
            attrs["destinationCity"] = None
            attrs["destinationDistrict"] = None
            return attrs
        ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest api/apps/profiles/tests/test_admin_resume_import.py::test_admin_resume_import_endpoint_accepts_missing_destination_fields -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/profiles/views/web_admin.py api/apps/profiles/tests/test_admin_resume_import.py
git commit -m "feat: make vieclam24h destination optional"
```

### Task 2: Simplify import modal and request payload

**Files:**
- Modify: `frontend/src/views/adminPages/ProfilesPage/index.tsx`
- Modify: `frontend/src/services/adminManagementService.ts`
- Modify: `frontend/src/services/__tests__/adminManagementServiceResponse.test.ts`
- Modify: `frontend/src/views/adminPages/__tests__/ProfilesPageFilters.test.ts` if it snapshots the import modal

- [ ] **Step 1: Write the failing test**

```tsx
it('renders the import dialog without destination fields', async () => {
  render(<ProfilesPage />);
  await user.click(screen.getByRole('button', { name: /lấy ứng viên/i }));
  expect(screen.queryByLabelText(/tỉnh\/thành phố đích/i)).toBeNull();
  expect(screen.queryByLabelText(/quận\/huyện đích/i)).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --runInBand src/views/adminPages/__tests__/ProfilesPageFilters.test.ts`
Expected: FAIL because the dialog still includes destination inputs.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [importForm, setImportForm] = useState({
  sourceUrl: 'https://ntd.vieclam24h.vn/employer/search/seeker',
  account: '',
  password: '',
  occupationIds: [] as number[],
});
```

```tsx
type Vieclam24hImportPayload = {
  sourceUrl: string;
  account: string;
  password: string;
  occupationIds?: number[];
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --runInBand src/views/adminPages/__tests__/ProfilesPageFilters.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/views/adminPages/ProfilesPage/index.tsx frontend/src/services/adminManagementService.ts frontend/src/services/__tests__/adminManagementServiceResponse.test.ts frontend/src/views/adminPages/__tests__/ProfilesPageFilters.test.ts
git commit -m "feat: simplify vieclam24h import modal"
```

### Task 3: Rebuild and verify

**Files:**
- No code changes

- [ ] **Step 1: Run backend tests**

Run: `pytest api/apps/profiles/tests/test_admin_resume_import.py api/apps/profiles/tests/test_vieclam24h_import.py -q`
Expected: PASS.

- [ ] **Step 2: Rebuild Docker**

Run: `docker compose up -d --build backend frontend nginx-gateway`
Expected: containers restart successfully and the backend becomes healthy.

- [ ] **Step 3: Smoke check**

Run: `docker compose ps`
Expected: backend/frontend/nginx-gateway are `Up`, backend is `healthy`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: verify minimal vieclam24h import flow"
```
