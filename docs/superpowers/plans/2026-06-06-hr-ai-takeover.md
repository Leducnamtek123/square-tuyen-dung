# HR AI Takeover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let employers hear candidates reliably during live participation and add a takeover mode where the employer can speak on mic/camera while the AI interviewer pauses.

**Architecture:** Keep the same LiveKit room. Backend grants HR presence publish permissions, frontend exposes a third chat-side mode that sends LiveKit text-control events, and the Python agent pauses or resumes AI replies when those events arrive.

**Tech Stack:** Django REST Framework, LiveKit Python API, LiveKit React components, Next.js React, Jest, pytest.

---

### Task 1: Backend HR Media Permission

**Files:**
- Modify: `api/apps/interviews/livekit_service.py`
- Modify: `api/apps/interviews/tests.py`

- [ ] Add a failing Django test proving `create_hr_presence_token` grants `can_publish=True`, `can_publish_data=True`, `can_subscribe=True`, and `hidden=False`.
- [ ] Update `LiveKitService.create_hr_presence_token` to allow HR audio/video publishing.
- [ ] Run `python manage.py test apps.interviews.tests.LiveKitServiceTests`.

### Task 2: Frontend Takeover Control

**Files:**
- Modify: `frontend/src/views/interviewPages/AIInterviewLayout.tsx`
- Modify: `frontend/src/views/interviewPages/__tests__/AIInterviewLayoutI18n.test.ts`
- Modify: `frontend/src/views/components/employers/InterviewLiveCandidateCard/__tests__/InterviewLiveAudioRenderer.test.ts`
- Modify: `frontend/src/i18n/locales/vi/interview.json`
- Modify: `frontend/src/i18n/locales/en/interview.json`

- [ ] Add failing Jest tests proving the chat composer has `takeover` mode, a takeover LiveKit topic, and remote audio renderer remains present.
- [ ] Add the `Giữ quyền AI` tab, takeover status panel, and start/release actions.
- [ ] Send LiveKit control text on `square.interview.ai_takeover` with `acquire` and `release`.
- [ ] Ensure remote room audio stays rendered in HR live surfaces.
- [ ] Run the targeted Jest tests.

### Task 3: Agent Pause And Resume

**Files:**
- Modify: `voice-ai/livekit_agent/src/interviewer.py`
- Modify: `voice-ai/livekit_agent/src/agent.py`
- Modify: `voice-ai/livekit_agent/tests/test_interviewer_flow.py`

- [ ] Add failing pytest coverage for manual takeover pause and release behavior.
- [ ] Add `pause_for_employer_takeover`, `resume_from_employer_takeover`, and a guard that prevents scripted replies while paused.
- [ ] Register the new LiveKit text stream handler in the agent entrypoint.
- [ ] Run `uv run pytest tests/test_interviewer_flow.py`.

### Task 4: Verification

**Files:**
- No new production files.

- [ ] Run backend interview tests.
- [ ] Run frontend targeted tests and typecheck if practical.
- [ ] Run voice agent tests.
- [ ] If a dev server is available, validate the employer live route with Playwright; otherwise report why rendered validation could not be completed.
