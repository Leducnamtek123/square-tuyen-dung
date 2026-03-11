import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/voice-ai/components/livekit/select';
import { cn } from '@/voice-ai/lib/utils';

const selectVariants = ({ size }) => {
  if (size === 'sm') return 'h-8 text-xs';
  if (size === 'lg') return 'h-10';
  return 'h-9';
};

export function TrackDeviceSelect({
  kind,
  track,
  requestPermissions = false,
  onMediaDeviceError,
  onDeviceListChange,
  onActiveDeviceChange,
  ...props
}) {
  const { t } = useTranslation('interview');
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    track,
    requestPermissions,
    onError: onMediaDeviceError,
  });

  useEffect(() => {
    if (devices) {
      onDeviceListChange?.(devices);
    }
  }, [devices, onDeviceListChange]);

  useEffect(() => {
    if (activeDeviceId) {
      onActiveDeviceChange?.(activeDeviceId);
    }
  }, [activeDeviceId, onActiveDeviceChange]);

  const kindLabel = useMemo(() => {
    if (kind === 'audioinput') return t('voiceAi.devices.microphone');
    if (kind === 'videoinput') return t('voiceAi.devices.camera');
    return t('voiceAi.devices.device');
  }, [kind, t]);

  const size = props.size ?? 'default';
  const handleActiveDeviceChange = (deviceId) => {
    setActiveMediaDevice(deviceId);
  };

  return (
    <Select value={activeDeviceId || ''} onValueChange={handleActiveDeviceChange}>
      <SelectTrigger className={cn(selectVariants({ size }), props.className)}>
        <SelectValue placeholder={t('voiceAi.devices.select', { kind: kindLabel })} />
      </SelectTrigger>
      <SelectContent>
        {devices
          ?.filter((device) => device.deviceId !== '')
          .map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId} className="font-mono text-xs">
              {device.label || t('voiceAi.devices.unknown')}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
