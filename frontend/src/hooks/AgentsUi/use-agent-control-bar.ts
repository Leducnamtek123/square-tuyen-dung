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
  console.log("useInputControls: starting hook execution");
  
  let localParticipantHook: any;
  try {
    localParticipantHook = useLocalParticipant({ room });
    console.log("useInputControls: useLocalParticipant hook successful, output exists:", !!localParticipantHook);
  } catch (e) {
    console.error("useInputControls: useLocalParticipant hook failed!", e);
  }

  const { localParticipant, microphoneTrack } = localParticipantHook ?? {};

  const handleMicError = useCallback(
    (error: unknown) => {
      console.log("useInputControls: handleMicError triggered", error);
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
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

  let microphoneToggle: any;
  try {
    microphoneToggle = useTrackToggle(microphoneToggleOptions);
    console.log("useInputControls: useTrackToggle (mic) hook successful, type of toggle:", typeof microphoneToggle?.toggle);
  } catch (e) {
    console.error("useInputControls: useTrackToggle (mic) hook failed!", e);
  }

  const handleCamError = useCallback(
    (error: unknown) => {
      console.log("useInputControls: handleCamError triggered", error);
      onDeviceError?.({ source: Track.Source.Camera, error });
    },
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

  let cameraToggle: any;
  try {
    cameraToggle = useTrackToggle(cameraToggleOptions);
    console.log("useInputControls: useTrackToggle (cam) hook successful, type of toggle:", typeof cameraToggle?.toggle);
  } catch (e) {
    console.error("useInputControls: useTrackToggle (cam) hook failed!", e);
  }

  const handleScreenError = useCallback(
    (error: unknown) => {
      console.log("useInputControls: handleScreenError triggered", error);
      onDeviceError?.({ source: Track.Source.ScreenShare, error });
    },
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

  let screenShareToggle: any;
  try {
    screenShareToggle = useTrackToggle(screenShareToggleOptions);
    console.log("useInputControls: useTrackToggle (screen) hook successful");
  } catch (e) {
    console.error("useInputControls: useTrackToggle (screen) hook failed!", e);
  }

  const persistentChoicesOptions = useMemo(
    () => ({ preventSave: !saveUserChoices }),
    [saveUserChoices]
  );

  let persistentChoices: any;
  try {
    console.log("useInputControls: calling usePersistentUserChoices");
    persistentChoices = usePersistentUserChoices(persistentChoicesOptions);
    console.log("useInputControls: usePersistentUserChoices successful, output exists:", !!persistentChoices);
  } catch (e) {
    console.error("useInputControls: usePersistentUserChoices failed!", e);
  }

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = (persistentChoices || {}) as any;

  console.log("useInputControls: destructured persistent setters, typeof saveAudioInputDeviceId:", typeof saveAudioInputDeviceId);

  const handleAudioDeviceChange = useCallback(
    (deviceId: string | null | undefined) => {
      try {
        if (typeof saveAudioInputDeviceId === 'function') {
          saveAudioInputDeviceId(deviceId ?? 'default');
        }
      } catch (e) {
        console.error("useInputControls: handleAudioDeviceChange failed", e);
      }
    },
    [saveAudioInputDeviceId]
  );

  const handleVideoDeviceChange = useCallback(
    (deviceId: string | null | undefined) => {
      try {
        if (typeof saveVideoInputDeviceId === 'function') {
          saveVideoInputDeviceId(deviceId ?? 'default');
        }
      } catch (e) {
        console.error("useInputControls: handleVideoDeviceChange failed", e);
      }
    },
    [saveVideoInputDeviceId]
  );

  const handleToggleCamera = useCallback(
    async (enabled: boolean) => {
      console.log("useInputControls: handleToggleCamera", enabled);
      try {
        if (screenShareToggle?.enabled && typeof screenShareToggle?.toggle === 'function') {
          await screenShareToggle.toggle(false);
        }
        if (cameraToggle?.toggle && typeof cameraToggle?.toggle === 'function') {
          await cameraToggle.toggle(enabled);
          if (typeof saveVideoInputEnabled === 'function') {
            saveVideoInputEnabled(!cameraToggle.enabled);
          }
        }
      } catch (e) {
        console.error("useInputControls: handleToggleCamera process failed", e);
      }
    },
    [cameraToggle, screenShareToggle, saveVideoInputEnabled]
  );

  const handleToggleMicrophone = useCallback(
    async (enabled: boolean) => {
      console.log("useInputControls: handleToggleMicrophone", enabled);
      try {
        if (microphoneToggle?.toggle && typeof microphoneToggle?.toggle === 'function') {
          await microphoneToggle.toggle(enabled);
          if (typeof saveAudioInputEnabled === 'function') {
            saveAudioInputEnabled(!microphoneToggle.enabled);
          }
        }
      } catch (e) {
        console.error("useInputControls: handleToggleMicrophone process failed", e);
      }
    },
    [microphoneToggle, saveAudioInputEnabled]
  );

  const handleToggleScreenShare = useCallback(
    async (enabled: boolean) => {
      console.log("useInputControls: handleToggleScreenShare", enabled);
      try {
        if (cameraToggle?.enabled && typeof cameraToggle?.toggle === 'function') {
          await cameraToggle.toggle(false);
        }
        if (screenShareToggle?.toggle && typeof screenShareToggle?.toggle === 'function') {
          await screenShareToggle.toggle(enabled);
        }
      } catch (e) {
        console.error("useInputControls: handleToggleScreenShare process failed", e);
      }
    },
    [cameraToggle, screenShareToggle]
  );

  const handleMicrophoneDeviceSelectError = useCallback(
    (error: unknown) => {
      console.log("useInputControls: microphone device select error", error);
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
    [onDeviceError]
  );

  const handleCameraDeviceSelectError = useCallback(
    (error: unknown) => {
      console.log("useInputControls: camera device select error", error);
      onDeviceError?.({ source: Track.Source.Camera, error });
    },
    [onDeviceError]
  );

  console.log("useInputControls: final memo creation");

  return useMemo(
    () => {
      console.log("useInputControls: generating final memo object");
      return {
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
      };
    },
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

