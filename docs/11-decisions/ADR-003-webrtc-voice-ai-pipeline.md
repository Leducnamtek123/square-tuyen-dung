# ADR-003: Real-Time WebRTC Voice AI Pipeline

> **Status**: ACCEPTED  
> **Date**: 2026-10-03  
> **Deciders**: Voice AI Lead, Architecture Lead, Backend Lead  
> **Consulted**: Frontend Team, Infrastructure Lead  
> **Informed**: All Engineering Staff

---

## 1. Context & Problem Statement

InfoHR provides automated conversational Voice AI interviews in Vietnamese. The interview session requires:
1. Bidirectional real-time audio communication with latency under 1.5 seconds.
2. Low-overhead Vietnamese Speech-to-Text (STT) and expressive Text-to-Speech (TTS).
3. Natural turn-taking and interruption handling (Barge-in / Voice Activity Detection).
4. Synchronized talking-head avatar video lip-sync.
5. High-fidelity audio/video recording for employer verification.

We needed a scalable, production-grade media server and AI pipeline architecture.

---

## 2. Decision Drivers

- End-to-End Latency: Round-trip response time must stay below 1,500ms for natural conversation.
- Network Resilience: Stable performance over varied candidate Internet connections across Vietnam.
- Native Vietnamese Speech Quality: Accurate diacritics recognition and regional accent support.
- Media Archival: Scalable egress recording directly into MinIO S3.

---

## 3. Considered Options

- **Option 1: LiveKit SFU + Python Agent Runner + Local/Cloud Speech Pipeline**
- **Option 2: Pure WebSocket Full-Duplex Audio Streaming (Custom FastAPI)**
- **Option 3: WebRTC via Asterisk / FreeSWITCH PBX**

---

## 4. Decision Outcome

**Chosen Option**: **Option 1 (LiveKit SFU + Python Agent Runner)**.

### Rationale:
1. **LiveKit Ecosystem Maturity**: LiveKit provides a battle-tested WebRTC SFU, native Python Agent SDK (`livekit-agents`), and ready-to-use client libraries for React (`@livekit/components-react`).
2. **Built-in Egress Service**: LiveKit Egress handles room recording, composite rendering, and uploads directly to MinIO S3 without overloading application containers.
3. **Decoupled Speech Models**: The Python agent worker interacts with fast streaming STT (Whisper) and flexible TTS (Vieneu / Edge / Azure) with built-in Silero VAD for intelligent barge-in interruption.

---

## 5. Pros & Cons of the Options

### Option 1: LiveKit SFU (Chosen)
- Good: Industry-standard WebRTC SFU with adaptive bitrate and packet loss concealment.
- Good: Native turn-taking and interruption handling in `livekit-agents`.
- Good: Seamless egress recording to S3 buckets.
- Bad: Requires managing LiveKit server container and egress dependencies.

### Option 2: Custom WebSocket Audio
- Good: Simpler networking than WebRTC.
- Bad: Lacks adaptive bitrate, jitter buffers, and echo cancellation built into WebRTC; poor quality on mobile networks.

### Option 3: Asterisk / FreeSWITCH PBX
- Good: Established telephony protocols.
- Bad: Heavy SIP legacy overhead, unsuitable for modern browser-based web applications.
