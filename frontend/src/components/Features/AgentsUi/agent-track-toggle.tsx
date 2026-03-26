import { Fragment, useMemo, useState } from 'react';
import type { ComponentProps, ComponentType } from 'react';
import { cva } from 'class-variance-authority';
import { Track } from 'livekit-client';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { cn } from '@/lib/utils';

export const agentTrackToggleVariants = cva(['size-9'], {
  variants: {
    size: {
      default: 'h-9 px-2 min-w-9',
      sm: 'h-8 px-1.5 min-w-8',
      lg: 'h-10 px-2.5 min-w-10',
    },
    variant: {
      default: [
        'data-[state=off]:bg-destructive/10 data-[state=off]:text-destructive',
        'data-[state=off]:hover:bg-destructive/15',
        'data-[state=off]:focus-visible:ring-destructive/30',
        'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        'data-[state=on]:hover:bg-foreground/10',
      ],
      outline: [
        'data-[state=off]:bg-destructive/10 data-[state=off]:text-destructive data-[state=off]:border-destructive/20',
        'data-[state=off]:hover:bg-destructive/15 data-[state=off]:hover:text-destructive',
        'data-[state=off]:focus:text-destructive',
        'data-[state=off]:focus-visible:border-destructive data-[state=off]:focus-visible:ring-destructive/30',
        'data-[state=on]:hover:bg-foreground/10 data-[state=on]:hover:border-foreground/12',
        'dark:data-[state=on]:hover:bg-foreground/10',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type AgentTrackToggleProps = {
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
  source: Track.Source;
  pending?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  className?: string;
  onPressedChange?: (pressed: boolean) => void;
} & Omit<ComponentProps<'button'>, 'onChange'>;

const PendingIcon = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
      className
    )}
  />
);

function getSourceIcon(source: Track.Source, enabled: boolean, pending = false) {
  if (pending) {
    return PendingIcon;
  }

  switch (source) {
    case Track.Source.Microphone:
      return enabled ? MicIcon : MicOffIcon;
    case Track.Source.Camera:
      return enabled ? VideocamIcon : VideocamOffIcon;
    case Track.Source.ScreenShare:
      return enabled ? ScreenShareIcon : StopScreenShareIcon;
    default:
      return Fragment;
  }
}

/**
 * A toggle button for controlling track publishing state.
 * Displays appropriate icons based on the track source and state.
 *
 * @extends ComponentProps<'button'>
 *
 * @example
 * ```tsx
 * <AgentTrackToggle
 *   source={Track.Source.Microphone}
 *   pressed={isMicEnabled}
 *   onPressedChange={(pressed) => setMicEnabled(pressed)}
 * />
 * ```
 */
export function AgentTrackToggle({
  size = 'default',
  variant = 'default',
  source,
  pending = false,
  pressed,
  defaultPressed = false,
  className,
  onPressedChange,
  ...props
}: AgentTrackToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed ?? false);
  const isControlled = pressed !== undefined;
  const resolvedPressed = useMemo(
    () => (isControlled ? pressed : uncontrolledPressed) ?? false,
    [isControlled, pressed, uncontrolledPressed]
  );
  const IconComponent = getSourceIcon(source, resolvedPressed, pending) as ComponentType<{ className?: string }>;
  const handlePressedChange = (nextPressed: boolean) => {
    if (!isControlled) {
      setUncontrolledPressed(nextPressed);
    }
    onPressedChange?.(nextPressed);
  };
  return (
    <button
      type="button"
      aria-pressed={resolvedPressed}
      aria-label={`Toggle ${source}`}
      onClick={() => handlePressedChange(!resolvedPressed)}
      data-state={resolvedPressed ? 'on' : 'off'}
      className={cn(agentTrackToggleVariants({
        size,
        variant: variant ?? 'default',
        className,
      }))}
      {...props}>
      <IconComponent className={cn(pending && 'animate-spin')} />
      {props.children}
    </button>
  );
}
