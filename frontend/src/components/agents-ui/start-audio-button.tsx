// @ts-nocheck
import { useEnsureRoom, useStartAudio } from '@livekit/components-react';
import Button from '@mui/material/Button';
import type { ComponentProps, ReactNode } from 'react';

/**
 * A button that allows users to start audio playback.
 * Required for browsers that block autoplay of audio.
 * Only renders when audio playback is blocked.
 *
 * @extends ComponentProps<'button'>
 *
 * @example
 * ```tsx
 * <StartAudioButton label="Click to allow audio playback" />
 * ```
 */
export function StartAudioButton({
 size = 'default',
 variant = 'default',
 label,
 room,
 ...props
}: StartAudioButtonProps) {
  const roomEnsured = useEnsureRoom(room);
  const { mergedProps } = useStartAudio({ room: roomEnsured, props });
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained';
  const muiSize = size === 'sm' || size === 'xs' ? 'small' : size === 'lg' ? 'large' : 'medium';

  return (
   <Button size={muiSize} variant={muiVariant} {...props} {...(mergedProps as any)}>
    {label}
   </Button>
  );
}

type StartAudioButtonProps = {
  size?: 'default' | 'sm' | 'xs' | 'lg' | string;
  variant?: 'default' | 'outline' | string;
  label?: ReactNode;
  room?: any;
} & Omit<ComponentProps<typeof Button>, 'size' | 'variant'>;
