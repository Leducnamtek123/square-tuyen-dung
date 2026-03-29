import { useCallback, useMemo } from 'react';
import { Track, Room } from 'livekit-client';
import {
  useTrackToggle,
  usePersistentUserChoices,
  useLocalParticipantPermissions,
  useLocalParticipant,
} from '@livekit/components-react';

/** Local type matching the expected toggle sources for useTrackToggle */
type ToggleSource = Track.Source.Camera | Track.Source.Microphone | Track.Source.ScreenShare;

export type DeviceErrorHandler = (error: { source: Track.Source; error: unknown }) => void;

const trackSourceToProtocol = (source: Track.Source): number => {
  // NOTE: this mapping avoids importing the protocol package as that leads to a significant bundle size increase
  switch (source) {
    case Track.Source.Camera:
      return 1;
    case Track.Source.Microphone:
      return 2;
    case Track.Source.ScreenShare:
      return 3;
    default:
      return 0;
  }
};

/**
 * Hook to manage publishing permissions (unified access to MIC/CAM/SCREEN permissions).
 */
export function usePublishPermissions() {
  const localPermissions = useLocalParticipantPermissions();

  const canPublishSource = useCallback(
    (source: Track.Source): boolean => {
      if (!localPermissions) return false;
      const protocolSource = trackSourceToProtocol(source);
      return (
        !!localPermissions.canPublish &&
        (localPermissions.canPublishSources.length === 0 ||
          localPermissions.canPublishSources.includes(protocolSource))
      );
    },
    [localPermissions]
  );

  return useMemo(
    () => ({
      camera: canPublishSource(Track.Source.Camera),
      microphone: canPublishSource(Track.Source.Microphone),
      screenShare: canPublishSource(Track.Source.ScreenShare),
      data: localPermissions?.canPublishData ?? false,
    }),
    [canPublishSource, localPermissions]
  );
}

/**
 * Hook to manage input controls (mic, camera, screen share) with persistence and error handling.
 */
export function useInputControls(
  {
    saveUserChoices = true,
    onDeviceError,
    room,
  }: {
    saveUserChoices?: boolean;
    onDeviceError?: DeviceErrorHandler;
    room?: Room;
  } = {}
) {
  // 1. Core Hooks
  const localParticipantHook = useLocalParticipant({ room });
  const { microphoneTrack } = localParticipantHook || {};

  // 2. Error Handlers
  const handleMicError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Microphone, error }),
    [onDeviceError]
  );
  const handleCamError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Camera, error }),
    [onDeviceError]
  );
  const handleScreenError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.ScreenShare, error }),
    [onDeviceError]
  );

  // 3. Memoized Hook Options
  const microphoneToggleOptions = useMemo(
    () => ({ source: Track.Source.Microphone as ToggleSource, onDeviceError: handleMicError, room }),
    [handleMicError, room]
  );
  const cameraToggleOptions = useMemo(
    () => ({ source: Track.Source.Camera as ToggleSource, onDeviceError: handleCamError, room }),
    [handleCamError, room]
  );
  const screenShareToggleOptions = useMemo(
    () => ({ source: Track.Source.ScreenShare as ToggleSource, onDeviceError: handleScreenError, room }),
    [handleScreenError, room]
  );
  const persistentChoicesOptions = useMemo(
    () => ({ preventSave: !saveUserChoices }),
    [saveUserChoices]
  );

  // 4. LiveKit Interaction Hooks
  const microphoneToggle = useTrackToggle(microphoneToggleOptions);
  const cameraToggle = useTrackToggle(cameraToggleOptions);
  const screenShareToggle = useTrackToggle(screenShareToggleOptions);
  const persistentChoices = usePersistentUserChoices(persistentChoicesOptions);

  const persistentData = persistentChoices || {} as Record<string, unknown>;
  const saveAudioInputEnabled = 'saveAudioInputEnabled' in persistentData
    ? (persistentData as { saveAudioInputEnabled: (v: boolean) => void }).saveAudioInputEnabled
    : undefined;
  const saveVideoInputEnabled = 'saveVideoInputEnabled' in persistentData
    ? (persistentData as { saveVideoInputEnabled: (v: boolean) => void }).saveVideoInputEnabled
    : undefined;
  const saveAudioInputDeviceId = 'saveAudioInputDeviceId' in persistentData
    ? (persistentData as { saveAudioInputDeviceId: (v: string) => void }).saveAudioInputDeviceId
    : undefined;
  const saveVideoInputDeviceId = 'saveVideoInputDeviceId' in persistentData
    ? (persistentData as { saveVideoInputDeviceId: (v: string) => void }).saveVideoInputDeviceId
    : undefined;

  // 6. Callbacks
  const handleAudioDeviceChange = useCallback(
    (deviceId: string | null | undefined) => {
      if (typeof saveAudioInputDeviceId === 'function') {
        saveAudioInputDeviceId(deviceId ?? 'default');
      }
    },
    [saveAudioInputDeviceId]
  );

  const handleVideoDeviceChange = useCallback(
    (deviceId: string | null | undefined) => {
      if (typeof saveVideoInputDeviceId === 'function') {
        saveVideoInputDeviceId(deviceId ?? 'default');
      }
    },
    [saveVideoInputDeviceId]
  );

  const handleToggleCamera = useCallback(
    async (enabled: boolean) => {
      if (screenShareToggle?.enabled && typeof screenShareToggle.toggle === 'function') {
        await screenShareToggle.toggle(false);
      }
      if (typeof cameraToggle?.toggle === 'function') {
        await cameraToggle.toggle(enabled);
        if (typeof saveVideoInputEnabled === 'function') {
          saveVideoInputEnabled(enabled);
        }
      }
    },
    [cameraToggle, screenShareToggle, saveVideoInputEnabled]
  );

  const handleToggleMicrophone = useCallback(
    async (enabled: boolean) => {
      if (typeof microphoneToggle?.toggle === 'function') {
        await microphoneToggle.toggle(enabled);
        if (typeof saveAudioInputEnabled === 'function') {
          saveAudioInputEnabled(enabled);
        }
      }
    },
    [microphoneToggle, saveAudioInputEnabled]
  );

  const handleToggleScreenShare = useCallback(
    async (enabled: boolean) => {
      if (cameraToggle?.enabled && typeof cameraToggle.toggle === 'function') {
        await cameraToggle.toggle(false);
      }
      if (typeof screenShareToggle?.toggle === 'function') {
        await screenShareToggle.toggle(enabled);
      }
    },
    [cameraToggle, screenShareToggle]
  );

  const handleMicrophoneDeviceSelectError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Microphone, error }),
    [onDeviceError]
  );

  const handleCameraDeviceSelectError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Camera, error }),
    [onDeviceError]
  );

  // 7. Final Memoized Return
  return useMemo(
    () => ({
      microphoneTrack,
      cameraToggle: {
        ...cameraToggle,
        enabled: cameraToggle?.enabled ?? false,
        pending: cameraToggle?.pending ?? false,
        toggle: handleToggleCamera,
      },
      microphoneToggle: {
        ...microphoneToggle,
        enabled: microphoneToggle?.enabled ?? false,
        pending: microphoneToggle?.pending ?? false,
        toggle: handleToggleMicrophone,
      },
      screenShareToggle: {
        ...screenShareToggle,
        enabled: screenShareToggle?.enabled ?? false,
        pending: screenShareToggle?.pending ?? false,
        toggle: handleToggleScreenShare,
      },
      handleAudioDeviceChange,
      handleVideoDeviceChange,
      handleMicrophoneDeviceSelectError,
      handleCameraDeviceSelectError,
    }),
    [
      microphoneTrack,
      cameraToggle,
      handleToggleCamera,
      microphoneToggle,
      handleToggleMicrophone,
      screenShareToggle,
      handleToggleScreenShare,
      handleAudioDeviceChange,
      handleVideoDeviceChange,
      handleMicrophoneDeviceSelectError,
      handleCameraDeviceSelectError,
    ]
  );
}

