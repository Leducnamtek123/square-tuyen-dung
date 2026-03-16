import { useEnsureRoom, useStartAudio } from '@livekit/components-react';
import { Button } from '@/components/ui/button';

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
}) {
  const roomEnsured = useEnsureRoom(room);
  const { mergedProps } = useStartAudio({ room: roomEnsured, props });

  return (
   <Button size={size} variant={variant} {...props} {...mergedProps}>
    {label}
   </Button>
  );
}
