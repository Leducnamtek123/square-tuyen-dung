# Employer Live Interview Execution & History Architecture

## 1. Real-time LiveKit Architecture
- **Room Topology**:
  - LiveKit server WebRTC audio/video tracks for Candidate and Recruiter/Observer.
  - Candidate: Publishes microphone and webcam tracks.
  - Recruiter: Joins in Observer Mode (`create_observer_livekit_token`) or Active HR Presence Mode (`create_hr_presence_livekit_token`).
  - AI Interviewer Agent: Subscribes to candidate audio track, processes real-time Speech-to-Text (STT), feeds conversation to LLM orchestrator, and streams response via ElevenLabs Text-to-Speech (TTS).

## 2. Real-time Transcript & Status Synchronization
- **Server-Sent Events (SSE) Stream**:
  - Endpoint: `GET /api/v1/interviews/web/sessions/{id}/stream/` (`interview_event_stream` in `api/apps/interviews/sse_views.py`).
  - Streams real-time event updates: `transcript_appended`, `status_updated`, `agent_speaking_started`, `agent_speaking_finished`.
- **Live Interview Room Polling & Auto-Refresh**:
  - `InterviewLivePage` implements `useReducer` with 10-second polling and automatic live status badge updates (`DRAFT`, `SCHEDULED`, `CALIBRATION`, `IN_PROGRESS`, `PROCESSING`, `COMPLETED`).

## 3. Interview History & Recording Playback
- **Media Asset Storage**:
  - Full interview composite video and audio recordings are processed by backend tasks (`apps.interviews.tasks.process_interview_recording`) and stored in Cloudinary.
  - Video cards sanitize and preview MP4 streams via `getSafeResourceUrl` and HTML5 `<video preload="metadata">`.
  - Transcripts and AI scoring breakdowns (Technical, Soft Skills, Communication, Problem Solving) are persisted in `InterviewEvaluation` and accessible in tabular or grid views.
