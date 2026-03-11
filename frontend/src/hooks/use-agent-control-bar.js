import { useCallback } from 'react';
import { Track } from 'livekit-client';
import {
  useTrackToggle,
  usePersistentUserChoices,
  useLocalParticipantPermissions,
  useLocalParticipant,
} from '@livekit/components-react';

const trackSourceToProtocol = (source) => {
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

export function usePublishPermissions() {
  const localPermissions = useLocalParticipantPermissions();

  const canPublishSource = (source) => {
    return (!!localPermissions?.canPublish && (localPermissions.canPublishSources.length === 0 || localPermissions.canPublishSources.includes(trackSourceToProtocol(source))));
  };

  return {
    camera: canPublishSource(Track.Source.Camera),
    microphone: canPublishSource(Track.Source.Microphone),
    screenShare: canPublishSource(Track.Source.ScreenShare),
    data: localPermissions?.canPublishData ?? false,
  };
}

export function useInputControls(
  {
    saveUserChoices = true,
    onDeviceError
  } = {}
) {
  const { microphoneTrack } = useLocalParticipant();

  const microphoneToggle = useTrackToggle({
    source: Track.Source.Microphone,
    onDeviceError: (error) => onDeviceError?.({ source: Track.Source.Microphone, error }),
  });

  const cameraToggle = useTrackToggle({
    source: Track.Source.Camera,
    onDeviceError: (error) => onDeviceError?.({ source: Track.Source.Camera, error }),
  });

  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
    onDeviceError: (error) => onDeviceError?.({ source: Track.Source.ScreenShare, error }),
  });

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  const handleAudioDeviceChange = useCallback((deviceId) => {
    saveAudioInputDeviceId(deviceId ?? 'default');
  }, [saveAudioInputDeviceId]);

  const handleVideoDeviceChange = useCallback((deviceId) => {
    saveVideoInputDeviceId(deviceId ?? 'default');
  }, [saveVideoInputDeviceId]);

  const handleToggleCamera = useCallback(async (enabled) => {
    if (screenShareToggle.enabled) {
      screenShareToggle.toggle(false);
    }
    await cameraToggle.toggle(enabled);
    // persist video input enabled preference
    saveVideoInputEnabled(!cameraToggle.enabled);
  }, [cameraToggle, screenShareToggle, saveVideoInputEnabled]);

  const handleToggleMicrophone = useCallback(async (enabled) => {
    await microphoneToggle.toggle(enabled);
    // persist audio input enabled preference
    saveAudioInputEnabled(!microphoneToggle.enabled);
  }, [microphoneToggle, saveAudioInputEnabled]);

  const handleToggleScreenShare = useCallback(async (enabled) => {
    if (cameraToggle.enabled) {
      cameraToggle.toggle(false);
    }
    await screenShareToggle.toggle(enabled);
  }, [cameraToggle, screenShareToggle]);
  const handleMicrophoneDeviceSelectError = useCallback(
    (error) => onDeviceError?.({ source: Track.Source.Microphone, error }),
    [onDeviceError]
  );

  const handleCameraDeviceSelectError = useCallback(
    (error) => onDeviceError?.({ source: Track.Source.Camera, error }),
    [onDeviceError]
  );

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
}
