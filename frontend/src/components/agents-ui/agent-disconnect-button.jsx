'use client';;
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSessionContext } from '@livekit/components-react';
import { PhoneOffIcon } from 'lucide-react';

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
}) {
  const { end } = useSessionContext();
  const handleClick = (event) => {
    onClick?.(event);
    if (typeof end === 'function') {
      end();
    }
  };

  return (
    <Button size={size} variant={variant} onClick={handleClick} {...props}>
      {icon ?? <PhoneOffIcon />}
      {children ?? <span className={cn(size?.includes('icon') && 'sr-only')}>END CALL</span>}
    </Button>
  );
}
