'use client';;
import Button from '@mui/material/Button';
import { cn } from '@/lib/utils';
import { useRoomContext } from '@livekit/components-react';
import { PhoneOffIcon } from 'lucide-react';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';

/**
 * A button to disconnect from the current agent session.
 * Calls the session's end() method when clicked.
 *
 * @extends ComponentProps<'button'>
 *
 * @example
 * ```tsx
 * <AgentDisconnectButton onClick={() => console.log('Disconnecting...')} />
 * ```
 */
export function AgentDisconnectButton({
  icon,
  size = 'default',
  variant = 'destructive',
  children,
  onClick,
  ...props
}: AgentDisconnectButtonProps) {
  const room = useRoomContext();
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (typeof room?.disconnect === 'function') {
      void room.disconnect();
    }
  };
  const muiVariant = variant === 'outline' ? 'outlined' : 'contained';
  const muiSize = size === 'sm' || size === 'xs' ? 'small' : size === 'lg' ? 'large' : 'medium';

  return (
    <Button
      size={muiSize}
      variant={muiVariant}
      color={variant === 'destructive' ? 'error' : 'inherit'}
      onClick={handleClick}
      {...props}
    >
      {icon ?? <PhoneOffIcon />}
      {children ?? <span className={cn(size?.includes('icon') && 'sr-only')}>END CALL</span>}
    </Button>
  );
}

type AgentDisconnectButtonProps = {
  icon?: ReactNode;
  size?: 'default' | 'sm' | 'xs' | 'lg' | string;
  variant?: 'default' | 'outline' | 'destructive' | string;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Omit<ComponentProps<typeof Button>, 'size' | 'variant' | 'onClick'>;
