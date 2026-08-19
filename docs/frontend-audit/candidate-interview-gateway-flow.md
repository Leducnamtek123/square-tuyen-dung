# Candidate AI Live Interview Room & Authentication Gateway Architecture

## 1. Candidate AI Interview Portal Gateway
- **Passcode & Magic Token Login**:
  - `CandidateLoginPage` (`/interview/login`) allows candidates to enter invited interview session tokens or credentials.
  - Validates session eligibility and verifies hardware media permissions prior to room entrance.

## 2. WebRTC LiveKit Candidate AI Interview Room
- **Real-time LiveKit Room Streaming**:
  - `InterviewRoomPageClient` (`/interview/[id]`) initializes LiveKit WebRTC media streams with dynamic audio visualizer, AI interviewer avatar/voice synthesis, question prompt cards, and auto-transcription feed.
  - Submits recorded telemetry, response timestamps, and automated evaluation metrics back to `/api/v1/interviews/sessions/[id]/`.

## 3. Employer Reset Password & Error Redirection
- **Multi-Tenant Recovery & Edge Traps**:
  - `/employer/reset-password/[token]` validates token expiration via `authService.resetPassword()`.
  - `/forbidden` (403) and `/employer` provide graceful role-based redirect pathways.
