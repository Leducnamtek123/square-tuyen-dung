import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Track } from 'livekit-client';
import { useTrackToggle } from '@livekit/components-react';
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  MonitorArrowUpIcon,
  MonitorIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
} from '@phosphor-icons/react';
import { Toggle } from '@/voice-ai/components/livekit/toggle';
import { cn } from '@/voice-ai/lib/utils';

function getSourceIcon(source, enabled, pending = false) {
  if (pending) return MonitorArrowUpIcon;
  if (source === Track.Source.Microphone) {
    return enabled ? MicrophoneIcon : MicrophoneSlashIcon;
  }
  if (source === Track.Source.Camera) {
    return enabled ? VideoCameraIcon : VideoCameraSlashIcon;
  }
  return enabled ? MonitorArrowUpIcon : MonitorIcon;
}

export function TrackToggle({ source, pressed, pending, className, ...props }) {
  const { t } = useTranslation('interview');
  const toggle = useTrackToggle({ source });
  const isEnabled = pressed ?? toggle.enabled;
  const isPending = pending ?? toggle.pending;
  const IconComponent = useMemo(() => getSourceIcon(source, isEnabled, isPending), [
    source,
    isEnabled,
    isPending,
  ]);

  const sourceLabel =
    source === Track.Source.Microphone
      ? t('voiceAi.aria.microphone')
      : source === Track.Source.Camera
        ? t('voiceAi.aria.camera')
        : t('voiceAi.aria.screenShare');

  return (
    <Toggle
      size="icon"
      variant="secondary"
      aria-label={t('voiceAi.aria.toggleGeneric', { target: sourceLabel })}
      pressed={isEnabled}
      disabled={isPending}
      className={className}
      onPressedChange={toggle.toggle}
      {...props}
    >
      <IconComponent weight="bold" className={cn(isPending && 'animate-spin')} />
    </Toggle>
  );
}
