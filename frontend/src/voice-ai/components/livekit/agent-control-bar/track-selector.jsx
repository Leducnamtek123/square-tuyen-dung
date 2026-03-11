import { Track } from 'livekit-client';
import { BarVisualizer, useTrackToggle } from '@livekit/components-react';
import { TrackDeviceSelect } from '@/voice-ai/components/livekit/agent-control-bar/track-device-select';
import { TrackToggle } from '@/voice-ai/components/livekit/agent-control-bar/track-toggle';
import { cn } from '@/voice-ai/lib/utils';

export function TrackSelector({
  kind,
  source,
  pressed,
  pending,
  disabled,
  className,
  audioTrackRef,
  onPressedChange,
  onMediaDeviceError,
  onActiveDeviceChange,
}) {
  const toggle = useTrackToggle({ source });
  const isEnabled = pressed ?? toggle.enabled;
  const isPending = pending ?? toggle.pending;

  return (
    <div className={cn('flex items-center gap-0', className)}>
      <TrackToggle
        source={source}
        pressed={isEnabled}
        pending={isPending}
        disabled={disabled}
        onPressedChange={onPressedChange ?? toggle.toggle}
      >
        {source === Track.Source.Microphone && audioTrackRef && (
          <BarVisualizer
            barCount={4}
            state={isEnabled ? 'speaking' : 'silent'}
            trackRef={audioTrackRef}
            className="flex h-full items-center justify-center gap-1"
          >
            <span className="bg-muted min-h-2.5 w-2.5 rounded-full" />
          </BarVisualizer>
        )}
      </TrackToggle>

      <hr className="bg-border peer-data-[state=off]/track:bg-destructive/20 relative z-10 -mr-px hidden h-4 w-px border-none has-[~_button]:block" />

      <TrackDeviceSelect
        kind={kind}
        source={source}
        requestPermissions={isEnabled}
        onMediaDeviceError={onMediaDeviceError}
        onActiveDeviceChange={onActiveDeviceChange}
      />
    </div>
  );
}
