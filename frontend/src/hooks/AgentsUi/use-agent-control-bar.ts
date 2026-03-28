import { useCallback, useMemo } from 'react';
import { Track } from 'livekit-client';
import {
  useTrackToggle,
  usePersistentUserChoices,
  useLocalParticipantPermissions,
  useLocalParticipant,
} from '@livekit/components-react';

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
 * Hook to check if the local participant has permissions to publish a specific source.
 */
export function usePublishPermissions() {
  const localPermissions = useLocalParticipantPermissions();

  const canPublishSource = useCallback(
    (source: Track.Source): boolean => {
      if (!localPermissions) return false;
      return (
        !!localPermissions.canPublish &&
        (localPermissions.canPublishSources.length === 0 ||
          localPermissions.canPublishSources.includes(trackSourceToProtocol(source)))
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
    room?: any;
  } = {}
) {
  const localParticipantHook = useLocalParticipant({ room });
  const { localParticipant, microphoneTrack } = localParticipantHook ?? {};

  const handleMicError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Microphone, error }),
    [onDeviceError]
  );

  const microphoneToggleOptions = useMemo(
    () => ({
      source: Track.Source.Microphone as any,
      onDeviceError: handleMicError,
      room,
    }),
    [handleMicError, room]
  );

  const microphoneToggle = useTrackToggle(microphoneToggleOptions);

  const handleCamError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.Camera, error }),
    [onDeviceError]
  );

  const cameraToggleOptions = useMemo(
    () => ({
      source: Track.Source.Camera as any,
      onDeviceError: handleCamError,
      room,
    }),
    [handleCamError, room]
  );

  const cameraToggle = useTrackToggle(cameraToggleOptions);

  const handleScreenError = useCallback(
    (error: unknown) => onDeviceError?.({ source: Track.Source.ScreenShare, error }),
    [onDeviceError]
  );

  const screenShareToggleOptions = useMemo(
    () => ({
      source: Track.Source.ScreenShare as any,
      onDeviceError: handleScreenError,
      room,
    }),
    [handleScreenError, room]
  );

  const screenShareToggle = useTrackToggle(screenShareToggleOptions);

  const persistentChoicesOptions = useMemo(
    () => ({ preventSave: !saveUserChoices }),
    [saveUserChoices]
  );

  const persistentChoices = usePersistentUserChoices(persistentChoicesOptions);

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = (persistentChoices || {}) as any;

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
      if (screenShareToggle?.enabled && typeof screenShareToggle?.toggle === 'function') {
        await screenShareToggle.toggle(false);
      }
      if (cameraToggle?.toggle && typeof cameraToggle?.toggle === 'function') {
        await cameraToggle.toggle(enabled);
        if (typeof saveVideoInputEnabled === 'function') {
          saveVideoInputEnabled(!cameraToggle.enabled);
        }
      }
    },
    [cameraToggle, screenShareToggle, saveVideoInputEnabled]
  );

  const handleToggleMicrophone = useCallback(
    async (enabled: boolean) => {
      if (microphoneToggle?.toggle && typeof microphoneToggle?.toggle === 'function') {
        await microphoneToggle.toggle(enabled);
        if (typeof saveAudioInputEnabled === 'function') {
          saveAudioInputEnabled(!microphoneToggle.enabled);
        }
      }
    },
    [microphoneToggle, saveAudioInputEnabled]
  );

  const handleToggleScreenShare = useCallback(
    async (enabled: boolean) => {
      if (cameraToggle?.enabled && typeof cameraToggle?.toggle === 'function') {
        await cameraToggle.toggle(false);
      }
      if (screenShareToggle?.toggle && typeof screenShareToggle?.toggle === 'function') {
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

  return useMemo(
    () => ({
      microphoneTrack,
      cameraToggle: {
        ...cameraToggle,
        toggle: handleToggleCamera,
      },
      microphoneToggle: {
        ...microphoneToggle,
        toggle: handleToggleMicrophone,
      },
      screenShareToggle: {
        ...screenShareToggle,
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

