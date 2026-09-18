# Admin AI Interview Infrastructure & Question Management Architecture

## 1. Global AI Interview Directory & Performance Logs
- **Platform Interview Oversight**:
  - `InterviewsPage` (`/admin/interviews`) aggregates completed and ongoing AI interviews across all companies with candidate scores, transcript sentiment, and media integrity verification.
  - Queries `/api/v1/interviews/sessions/` with admin filters.

## 2. Admin LiveKit Room Simulator & Audio Diagnostics
- **Diagnostic Sandbox**:
  - `InterviewPreviewPage` (`/admin/interview-preview`) simulates realistic candidate interview conditions with test audio wave feeds, synthesized TTS interviewer voices, and camera quality checks.

## 3. Question Bank & Skill Matrix Bundling
- **Standardized Question Governance**:
  - `QuestionBankPage` (`/admin/questions`) and `QuestionGroupsPage` (`/admin/question-groups`) manage multi-discipline interview questions categorized by seniority, domain (Software, Finance, HR), and evaluation rubrics.
  - Interacts with `/api/v1/interviews/questions/` and `/api/v1/interviews/question-groups/`.

## 4. AI Voice Profiles & Speech Synthesis Calibration
- **Custom TTS Engine Presets**:
  - `VoiceProfilesPage` (`/admin/voice-profiles`) allows administrators to configure ElevenLabs and Azure Speech synthesis models (accent, pitch, stability, speed) used during AI live interviews.
