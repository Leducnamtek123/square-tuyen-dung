# Voice Profile Cloning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current voice profile admin flow into a sample-driven clone workflow where admins upload one or more reference samples, explicitly prepare the profile, and reuse the same prepared profile for TTS and interview sessions.

**Architecture:** Reuse the existing `VoiceProfile`, `VoiceProfileSample`, and `VoiceProfileGrant` tables instead of introducing a separate training subsystem. Add a backend preparation action that validates samples, computes readiness metadata, and transitions profiles through `draft -> processing -> ready/failed`. On the frontend, make the admin page treat “Try voice” as runtime synthesis from the saved profile, not sample playback, and surface sample guidance, readiness state, and preparation controls clearly.

**Tech Stack:** Django REST Framework, existing interview services/viewsets, pytest, React, TanStack Query/Table, MUI, i18n JSON locale files, Jest.

---

### Task 1: Add voice profile preparation rules and status transitions on the backend

**Files:**
- Modify: `api/apps/interviews/services.py`
- Modify: `api/apps/interviews/serializers.py`
- Modify: `api/apps/interviews/views.py`
- Test: `api/apps/interviews/tests_voice_profiles.py`

- [ ] **Step 1: Write the failing tests**

```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch

from apps.accounts.models import User
from apps.interviews.models import VoiceProfile, VoiceProfileSample


class VoiceProfileCloningFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user_with_role_name(
            email="voice-admin@example.com",
            full_name="Voice Admin",
            role_name="ADMIN",
            password="password123",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_prepare_requires_at_least_one_sample(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )

        response = self.client.post(f"/api/v1/interview/web/voice-profiles/{profile.id}/prepare/")

        self.assertEqual(response.status_code, 400)
        self.assertIn("samples", response.json()["data"])

    def test_profile_stays_draft_after_sample_upload_until_prepared(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )

        sample_file = SimpleUploadedFile("sample.wav", b"fake wav bytes", content_type="audio/wav")

        with patch("shared.helpers.cloudinary_service.CloudinaryService.upload_file", return_value={"url": "https://cdn.test/sample.wav"}), \
             patch("apps.files.models.File.update_or_create_file_with_cloudinary") as mock_create_file:
            mock_create_file.return_value = type("FileStub", (), {"get_full_url": lambda self: "https://cdn.test/sample.wav"})()

            response = self.client.post(
                f"/api/v1/interview/web/voice-profiles/{profile.id}/samples/",
                data={"audio": sample_file, "referenceText": "Xin chao, day la mau ghi am."},
                format="multipart",
            )

        self.assertEqual(response.status_code, 201)
        profile.refresh_from_db()
        self.assertEqual(profile.status, VoiceProfile.STATUS_DRAFT)
        self.assertEqual(VoiceProfileSample.objects.filter(profile=profile).count(), 1)

    def test_prepare_marks_profile_ready_and_exposes_aggregate_metadata(self):
        profile = VoiceProfile.objects.create(
            name="Clone Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )

        VoiceProfileSample.objects.create(
            profile=profile,
            reference_text="Xin chao, day la mau ghi am dau tien.",
            sort_order=0,
        )
        VoiceProfileSample.objects.create(
            profile=profile,
            reference_text="Toi se noi them mot doan ngan de mo ta giong.",
            sort_order=1,
        )

        response = self.client.post(f"/api/v1/interview/web/voice-profiles/{profile.id}/prepare/")

        self.assertEqual(response.status_code, 200)
        profile.refresh_from_db()
        self.assertEqual(profile.status, VoiceProfile.STATUS_READY)
        self.assertEqual(profile.metadata["sampleCount"], 2)
        self.assertEqual(response.json()["data"]["status"], VoiceProfile.STATUS_READY)

    def test_ready_voice_profile_is_the_only_one_returned_for_runtime_tts(self):
        ready_profile = VoiceProfile.objects.create(
            name="Ready Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_READY,
            consent_confirmed=True,
        )
        draft_profile = VoiceProfile.objects.create(
            name="Draft Voice",
            voice_type=VoiceProfile.TYPE_CLONED,
            status=VoiceProfile.STATUS_DRAFT,
            consent_confirmed=True,
        )
        from types import SimpleNamespace
        from apps.interviews.services import resolve_voice_profile_for_session

        ready_session = SimpleNamespace(voice_profile=ready_profile, job_post=None)
        draft_session = SimpleNamespace(voice_profile=draft_profile, job_post=None)

        self.assertEqual(resolve_voice_profile_for_session(ready_session), ready_profile)
        self.assertIsNone(resolve_voice_profile_for_session(draft_session))
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest api/apps/interviews/tests_voice_profiles.py -q`
Expected: fail because there is no explicit prepare action, sample uploads still promote profiles too early, and the serializer does not expose readiness metadata yet.

- [ ] **Step 3: Implement the backend flow**

Add a small helper set in `api/apps/interviews/services.py` that:
- validates cloned profiles have at least one sample and non-empty transcript text,
- computes sample count and total sample duration from `VoiceProfileSample`,
- marks the profile `processing` while preparation is happening,
- marks the profile `ready` only after validation passes,
- stores any preparation failure reason in `metadata` so the UI can explain why a profile is blocked.

Then update `api/apps/interviews/views.py` so:
- `add_sample()` only uploads and saves the sample,
- cloned profiles do not auto-flip to `ready` on upload,
- `VoiceProfileViewSet` exposes a `POST /prepare/` action for admins,
- `build_tts_voice_profile_payload()` returns the computed sample count and duration fields along with the existing sample payload.

Update `api/apps/interviews/serializers.py` so the profile serializer exposes the readiness helpers needed by the UI, while preserving the existing admin CRUD contract.
Expose the computed `sampleCount`, `totalDurationSeconds`, and `isReadyForTts` fields through the serializer response so the admin page can show the real readiness state without guessing.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest api/apps/interviews/tests_voice_profiles.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/apps/interviews/services.py api/apps/interviews/serializers.py api/apps/interviews/views.py api/apps/interviews/tests_voice_profiles.py
git commit -m "feat: add voice profile preparation flow"
```

### Task 2: Turn the admin voice profile page into a real clone workflow

**Files:**
- Modify: `frontend/src/services/voiceProfileService.ts`
- Modify: `frontend/src/views/adminPages/VoiceProfilesPage/index.tsx`
- Modify: `frontend/src/views/adminPages/VoiceProfilesPage/voiceProfileFormValidation.ts`
- Modify: `frontend/src/types/models.ts`
- Test: `frontend/src/services/__tests__/voiceProfileService.test.ts`
- Test: `frontend/src/views/adminPages/VoiceProfilesPage/__tests__/voiceProfileFormValidation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import voiceProfileService from '../voiceProfileService';
import httpRequest from '../../utils/httpRequest';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

it('calls the prepare endpoint for a profile before playback', async () => {
  (httpRequest.post as jest.Mock).mockResolvedValueOnce({
    data: { data: { id: 12, status: 'ready', sampleCount: 2 } },
  });

  await expect(voiceProfileService.prepareVoiceProfile(12)).resolves.toEqual({
    id: 12,
    status: 'ready',
    sampleCount: 2,
  });

  expect(httpRequest.post).toHaveBeenCalledWith('interview/web/voice-profiles/12/prepare/', {});
});

it('keeps cloned profiles unready until the explicit prepare action succeeds', () => {
  const source = readFileSync(join(__dirname, '../../views/adminPages/VoiceProfilesPage/index.tsx'), 'utf8');
  expect(source).toContain('prepareVoiceProfile');
  expect(source).toContain("disabled={profile.status !== 'ready'}");
});
```

```ts
import { getVoiceProfileFormValidationErrors } from '../voiceProfileFormValidation';

it('requires transcript and at least one sample before allowing create-and-prepare for cloned voices', () => {
  const errors = getVoiceProfileFormValidationErrors({
    name: 'Clone Voice',
    language: 'vi',
    voiceType: 'cloned',
    presetVoiceId: '',
    consentConfirmed: true,
    sampleCount: 0,
  });

  expect(errors).toEqual({
    sampleCount: 'sampleRequired',
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
`npm test -- frontend/src/services/__tests__/voiceProfileService.test.ts frontend/src/views/adminPages/VoiceProfilesPage/__tests__/voiceProfileFormValidation.test.ts`

Expected: fail because the service does not yet expose `prepareVoiceProfile`, the form validation still only covers the old create flow, and the page does not enforce the sample-driven readiness step.

- [ ] **Step 3: Implement the frontend workflow**

Add a `prepareVoiceProfile(id)` method in `frontend/src/services/voiceProfileService.ts` that calls `POST interview/web/voice-profiles/{id}/prepare/`.

Update `frontend/src/views/adminPages/VoiceProfilesPage/index.tsx` so:
- the create dialog focuses on metadata plus sample guidance,
- the sample section supports adding more than one reference sample over time,
- “Try voice” stays tied to runtime synthesis from `voiceProfileId`,
- the test/play button is disabled until the profile is `ready`,
- the UI shows a clear readiness callout with `sampleCount`, `totalDurationSeconds`, and the `isReadyForTts` flag from the API,
- admins can explicitly click “Prepare voice” after uploading samples instead of being told a sample upload automatically finished the job.

Update `frontend/src/views/adminPages/VoiceProfilesPage/voiceProfileFormValidation.ts` so the cloned flow requires the same consent/sample guardrails as the backend.

Update `frontend/src/types/models.ts` so the client knows about `totalDurationSeconds` and the readiness flag returned by the API.

- [ ] **Step 4: Run the tests to verify they pass**

Run:
`npm test -- frontend/src/services/__tests__/voiceProfileService.test.ts frontend/src/views/adminPages/VoiceProfilesPage/__tests__/voiceProfileFormValidation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/voiceProfileService.ts frontend/src/views/adminPages/VoiceProfilesPage/index.tsx frontend/src/views/adminPages/VoiceProfilesPage/voiceProfileFormValidation.ts frontend/src/types/models.ts frontend/src/services/__tests__/voiceProfileService.test.ts frontend/src/views/adminPages/VoiceProfilesPage/__tests__/voiceProfileFormValidation.test.ts
git commit -m "feat: make voice profile admin flow sample-driven"
```

### Task 3: Clean up admin copy and i18n for the new voice workflow

**Files:**
- Modify: `frontend/src/i18n/locales/en/admin.json`
- Modify: `frontend/src/i18n/locales/vi/admin.json`
- Modify: `frontend/src/views/adminPages/VoiceProfilesPage/__tests__/VoiceProfilesPageI18n.test.ts`

- [ ] **Step 1: Write the failing test assertions**

```ts
expect(source).not.toContain('Create & Upload');
expect(source).not.toContain('Generated voice preview');
expect(source).toContain("'pages.voiceProfiles.actions.prepareVoice'");
expect(source).toContain("'pages.voiceProfiles.messages.readyForReuse'");
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- frontend/src/views/adminPages/VoiceProfilesPage/__tests__/VoiceProfilesPageI18n.test.ts`
Expected: fail until the new labels and guidance strings exist in both locales.

- [ ] **Step 3: Update locale copy**

Add matching Vietnamese and English keys for the new workflow copy, including:
- sample guidance,
- prepare action label,
- readiness hint,
- retry/failure hint,
- profile-based test playback label.

Keep the existing `voiceProfiles` namespace, but make the copy explain the difference between sample upload and runtime synthesis so admins do not confuse preview audio with a reusable cloned voice.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- frontend/src/views/adminPages/VoiceProfilesPage/__tests__/VoiceProfilesPageI18n.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/i18n/locales/en/admin.json frontend/src/i18n/locales/vi/admin.json frontend/src/views/adminPages/VoiceProfilesPage/__tests__/VoiceProfilesPageI18n.test.ts
git commit -m "feat: clarify voice profile admin copy"
```

### Task 4: Verify the full flow and restart Docker

**Files:**
- No code changes unless verification exposes a regression

- [ ] **Step 1: Run the backend voice profile tests**

Run: `pytest api/apps/interviews/tests_voice_profiles.py api/apps/interviews/tests.py -k voice_profile -q`
Expected: all voice profile tests pass.

- [ ] **Step 2: Run the frontend voice profile tests**

Run:
`npm test -- frontend/src/services/__tests__/voiceProfileService.test.ts frontend/src/views/adminPages/VoiceProfilesPage/__tests__/voiceProfileFormValidation.test.ts frontend/src/views/adminPages/VoiceProfilesPage/__tests__/VoiceProfilesPageI18n.test.ts`

Expected: PASS.

- [ ] **Step 3: Rebuild and restart Docker**

Run: `docker compose up -d --build`
Expected: containers rebuild cleanly and the app comes back with the new voice profile workflow live.

- [ ] **Step 4: Smoke test the end-to-end flow**

Verify in the browser:
- create a cloned voice profile,
- upload at least one sample with transcript text,
- click the new prepare action,
- confirm the profile becomes `ready`,
- confirm the test playback uses `voiceProfileId` rather than sample audio playback,
- confirm interview TTS can resolve the same profile again after refresh.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: ship voice profile cloning workflow"
```
