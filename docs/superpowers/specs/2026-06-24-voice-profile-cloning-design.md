# Voice Profile Cloning Design

## Goal

Turn the current "Hồ sơ giọng nói" feature into a Voicebox-style voice profile workflow:

- users/admins upload or record one or more reference samples,
- the system validates and transcribes the samples,
- the profile becomes reusable for test playback and interview TTS,
- the same profile can be kept and reused later without re-uploading audio every time.

This design keeps the current project architecture, but clarifies the split between:

- `voice profile` as stored reference data,
- `clone / inference` as runtime synthesis,
- `training` as an optional later upgrade, not the initial requirement.

## Product Decision

We will not implement a heavyweight model fine-tuning pipeline in this phase.
Instead, we will implement a robust voice profile preparation flow that behaves like Voicebox:

- a profile is created from a small set of reference samples,
- each sample includes audio plus transcript,
- the profile is marked ready only after validation,
- the profile is then used repeatedly for TTS generation.

This gives a practical "train once, use many times" experience without requiring custom model training infrastructure.

## Current State

The repo already has the main pieces:

- `VoiceProfile`
- `VoiceProfileSample`
- `VoiceProfileGrant`
- admin CRUD in FE/BE
- TTS preview in the admin voice profile page
- runtime TTS proxy

What is missing is the lifecycle and product boundary:

- no explicit preparation workflow,
- no sample quality rules,
- no automatic transcript validation,
- no visible distinction between "draft", "processing", "ready", and "failed" during voice setup.

## Proposed Flow

### 1. Create profile

Admin creates a cloned voice profile with:

- display name,
- language,
- voice type = cloned,
- consent confirmation,
- optional description.

The profile starts in `draft`.

### 2. Add reference samples

Admin adds one or more samples to the profile.

Each sample includes:

- audio file,
- reference text,
- optional notes,
- duration metadata.

Recommended validation rules:

- minimum 10 seconds total audio for usable profile,
- ideal 10-30 seconds total,
- minimum 1 sample,
- recommended 2-3 samples for better quality,
- reject empty or too-short transcripts,
- reject samples that are too silent or malformed.

### 3. Prepare profile

Once enough samples exist, the profile is moved to `processing`.

During this phase, backend can:

- normalize/transcode audio if needed,
- store sample metadata,
- optionally generate transcript confidence / quality flags,
- optionally generate cached voice embeddings or inference-ready artifacts.

When preparation succeeds, status becomes `ready`.

If it fails, status becomes `failed` with error details.

### 4. Test playback

The existing "Thử giọng" action uses the profile directly:

- for preset profiles: synthesize from preset voice id,
- for cloned profiles: synthesize from the stored profile samples / embedding.

This must be runtime synthesis, not sample playback.

### 5. Runtime reuse

Interview TTS and other callers use:

- `ttsVoice = profile:<id>`

The backend resolves the profile to the prepared voice data and reuses it for future requests.

## Data Model

Reuse the existing tables, with small additions:

### `VoiceProfile`

Keep existing fields and add/standardize:

- `status`: `draft | processing | ready | disabled | failed`
- `voice_type`: `cloned | preset`
- `preset_engine`
- `preset_voice_id`
- `consent_confirmed`

Optional additions for better UX:

- `processing_note`
- `last_error`
- `prepared_at`
- `sample_count`
- `total_duration_seconds`

### `VoiceProfileSample`

Keep:

- `audio_file`
- `reference_text`
- `duration_seconds`
- `sort_order`

Optional additions:

- `transcript_source` (`manual | uploaded | auto`)
- `quality_score`
- `is_valid`

### `VoiceProfileGrant`

Keep as-is.

Admins can continue to grant a profile to:

- company,
- job post,
- or both.

## Backend Responsibilities

### Admin API

The admin API should support:

- create/update/delete profiles,
- upload samples,
- list samples,
- mark profile as ready/failed after validation,
- grant profile to company/job,
- filter by status/type/search.

### TTS resolution

The TTS proxy must:

- accept `voiceProfileId`,
- resolve the profile,
- check profile status,
- synthesize using the correct engine/backend,
- return audio bytes and proper headers.

### Validation

Backend should reject:

- profile without samples,
- sample without transcript,
- cloned profile marked ready with too little usable audio,
- profile assigned to interview use while not ready.

## Frontend Responsibilities

The Voice Profiles page should make the lifecycle obvious:

- show status chip,
- show sample count and total duration,
- show a preparation callout,
- require transcript before upload/save,
- show a clear "ready for reuse" state,
- make "Thử giọng" use the current profile,
- show why a profile is not ready yet.

The create/edit dialog should separate:

- profile metadata,
- sample upload,
- readiness status.

## Error Handling

The system should not silently fall back to a sample preview for cloned voices.

Instead, if synthesis fails:

- the API should return a clear error,
- the UI should explain whether the issue is sample quality, missing transcript, or engine readiness,
- the profile should be marked `failed` only when the preparation step itself fails.

## Testing

Backend tests:

- profile creation validation,
- sample upload validation,
- status transitions,
- TTS resolution for cloned profiles,
- interview context uses ready voice profile only,
- admin permissions for CRUD/grants.

Frontend tests:

- voice profile form validation,
- sample-required UI,
- status labels,
- filtering,
- test playback error handling.

Integration checks:

- create profile,
- upload sample,
- mark ready,
- test playback,
- use the same profile in interview TTS.

## Non-Goals

This phase does not include:

- full model fine-tuning,
- custom LoRA training jobs,
- speaker diarization,
- automatic voice identity verification,
- celebrity voice cloning flows.

## Implementation Shape

Recommended implementation order:

1. formalize sample and readiness validation in BE,
2. update Voice Profile admin UI to show the lifecycle,
3. keep runtime TTS cloning on profile ids,
4. only add true training jobs later if the product really needs them.

