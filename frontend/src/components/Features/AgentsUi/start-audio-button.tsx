import { useEnsureRoom, useStartAudio } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
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
  const buttonVariant = variant === 'outline' ? 'outline' : 'default';
  const buttonSize = size === 'sm' || size === 'xs' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  return (
   <Button size={buttonSize} variant={buttonVariant} {...props} {...(mergedProps as any)}>
    {label}
   </Button>
  );
}

type StartAudioButtonProps = {
  size?: 'default' | 'sm' | 'xs' | 'lg' | string;
  variant?: 'default' | 'outline' | string;
  label?: ReactNode;
  room?: Parameters<typeof useEnsureRoom>[0];
} & Omit<ComponentProps<typeof Button>, 'size' | 'variant'>;
