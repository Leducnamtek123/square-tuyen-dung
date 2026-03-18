// @ts-nocheck
'use client';;
import { useEffect, useMemo, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentTrackToggle } from '@/components/agents-ui/agent-track-toggle';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { cn } from '@/lib/utils';

const AudioVisualizerBar = AgentAudioVisualizerBar as any;

const selectVariants = cva([
  'rounded-l-none shadow-none pl-2 ',
  'text-foreground hover:text-muted-foreground',
  'peer-data-[state=on]/track:bg-muted peer-data-[state=on]/track:hover:bg-foreground/10',
  'peer-data-[state=off]/track:text-destructive',
  'peer-data-[state=off]/track:focus-visible:border-destructive peer-data-[state=off]/track:focus-visible:ring-destructive/30',
  '[&_svg]:opacity-100',
], {
  variants: {
    variant: {
      default: [
        'border-none',
        'peer-data-[state=off]/track:bg-destructive/10',
        'peer-data-[state=off]/track:hover:bg-destructive/15',
        'peer-data-[state=off]/track:[&_svg]:text-destructive!',

        'dark:peer-data-[state=on]/track:bg-accent',
        'dark:peer-data-[state=on]/track:hover:bg-foreground/10',
        'dark:peer-data-[state=off]/track:bg-destructive/10',
        'dark:peer-data-[state=off]/track:hover:bg-destructive/15',
      ],
      outline: [
        'border border-l-0',
        'peer-data-[state=off]/track:border-destructive/20',
        'peer-data-[state=off]/track:bg-destructive/10',
        'peer-data-[state=off]/track:hover:bg-destructive/15',
        'peer-data-[state=off]/track:[&_svg]:text-destructive!',
        'peer-data-[state=on]/track:hover:border-foreground/12',

        'dark:peer-data-[state=off]/track:bg-destructive/10',
        'dark:peer-data-[state=off]/track:hover:bg-destructive/15',
        'dark:peer-data-[state=on]/track:bg-accent',
        'dark:peer-data-[state=on]/track:hover:bg-foreground/10',
      ],
    },
    size: {
      default: 'w-[180px]',
      sm: 'w-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

/**
 * A select component for selecting a media device.
 *
 * @extends ComponentProps<'button'>
 *
 * @example
 * ```tsx
 * <TrackDeviceSelect
 *   size="sm"
 *   variant="outline"
 *   kind="audioinput"
 *   track={micTrackRef}
 * />
 * ```
 */
type TrackDeviceSelectProps = {
  kind: MediaDeviceKind;
  track?: any;
  size?: 'default' | 'sm';
  variant?: 'default' | 'outline';
  className?: string;
  requestPermissions?: boolean;
  onMediaDeviceError?: (error: unknown) => void;
  onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
} & Omit<ComponentProps<typeof Select>, 'onChange' | 'value' | 'size' | 'variant'>;

function TrackDeviceSelect({
  kind,
  track,
  size = 'default',
  variant = 'default',
  className,
  requestPermissions = false,
  onMediaDeviceError,
  onDeviceListChange,
  onActiveDeviceChange,
  ...props
}: TrackDeviceSelectProps) {
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const [requestPermissionsState, setRequestPermissionsState] = useState(requestPermissions);
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    room,
    kind,
    track,
    requestPermissions: requestPermissionsState,
    onError: onMediaDeviceError,
  });

  useEffect(() => {
    onDeviceListChange?.(devices);
  }, [devices, onDeviceListChange]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setRequestPermissionsState(true);
    }
  };

  const handleActiveDeviceChange = (deviceId: string) => {
    setActiveMediaDevice(deviceId);
    onActiveDeviceChange?.(deviceId);
  };

  const filteredDevices = useMemo(() => devices.filter((d) => d.deviceId !== ''), [devices]);

  if (filteredDevices.length < 2) {
    return null;
  }

  return (
    <FormControl className={cn(selectVariants({ size, variant }), className)} size="small">
      <Select
        open={open}
        value={activeDeviceId || ''}
        onOpen={() => handleOpenChange(true)}
        onClose={() => handleOpenChange(false)}
        onChange={(event: SelectChangeEvent<string>) => handleActiveDeviceChange(event.target.value)}
        displayEmpty
        renderValue={(selected) => {
          const selectedValue = selected as string;
          if (!selectedValue) return size !== 'sm' ? `Select a ${kind}` : '';
          const device = filteredDevices.find((d) => d.deviceId === selectedValue);
          return (device?.label || selectedValue) as ReactNode;
        }}
        {...props}
      >
        {filteredDevices.map((device) => (
          <MenuItem
            key={device.deviceId}
            value={device.deviceId}
            className="font-mono text-xs"
          >
            {device.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/**
 * A combined track toggle and device selector control.
 * Includes a toggle button and a dropdown to select the active device.
 * For microphone tracks, displays an audio visualizer.
 *
 * @example
 * ```tsx
 * <AgentTrackControl
 *   kind="audioinput"
 *   source={Track.Source.Microphone}
 *   pressed={isMicEnabled}
 *   audioTrack={micTrackRef}
 *   onPressedChange={(pressed) => setMicEnabled(pressed)}
 *   onActiveDeviceChange={(deviceId) => setMicDevice(deviceId)}
 * />
 * ```
 */
export function AgentTrackControl({
  kind,
  variant = 'default',
  source,
  pressed,
  pending,
  disabled,
  className,
  audioTrack,
  onPressedChange,
  onMediaDeviceError,
  onActiveDeviceChange
}: AgentTrackControlProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0 rounded-md',
        variant === 'outline' && 'shadow-xs [&_button]:shadow-none',
        className
      )}>
      <AgentTrackToggle
        variant={variant ?? 'default'}
        source={source}
        pressed={pressed}
        pending={pending}
        disabled={disabled}
        onPressedChange={onPressedChange}
        className="peer/track group/track focus:z-10 has-[.audiovisualizer]:w-auto has-[.audiovisualizer]:px-3 has-[~_button]:rounded-r-none has-[~_button]:border-r-0 has-[~_button]:pr-2 has-[~_button]:pl-3">
        {audioTrack && (
          <AudioVisualizerBar
            size="icon"
            barCount={3}
            state={pressed ? 'speaking' : 'disconnected'}
            audioTrack={pressed ? audioTrack : undefined}
            className="audiovisualizer flex h-6 w-auto items-center justify-center gap-0.5">
            <span
              className={cn([
                'h-full min-h-0.5 w-0.5 origin-center',
                'group-data-[state=on]/track:bg-foreground group-data-[state=off]/track:bg-destructive',
                'data-lk-muted:bg-muted',
              ])} />
          </AudioVisualizerBar>
        )}
      </AgentTrackToggle>
      {kind && (
        <TrackDeviceSelect
          size="sm"
          kind={kind}
          variant={variant}
          requestPermissions={false}
          onMediaDeviceError={onMediaDeviceError}
          onActiveDeviceChange={onActiveDeviceChange}
          className={cn([
            'relative',
            'before:bg-border before:absolute before:inset-y-0 before:left-0 before:my-2.5 before:w-px has-[~_button]:before:content-[""]',
            !pressed && 'before:bg-destructive/20',
          ])} />
      )}
    </div>
  );
}

type AgentTrackControlProps = {
  kind?: MediaDeviceKind;
  variant?: 'default' | 'outline';
  source: any;
  pressed?: boolean;
  pending?: boolean;
  disabled?: boolean;
  className?: string;
  audioTrack?: any;
  onPressedChange?: (pressed: boolean) => void;
  onMediaDeviceError?: (error: unknown) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
};
