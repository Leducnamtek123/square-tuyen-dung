import { cn } from '@/voice-ai/lib/utils';

export const ChatEntry = ({
  className,
  locale,
  timestamp,
  message,
  name,
  hasBeenEdited,
  ...props
}) => {
  const safeLocale =
    typeof locale === 'string' && Intl?.DateTimeFormat?.supportedLocalesOf([locale]).length
      ? locale
      : undefined;
  const safeTimestamp =
    typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp) : null;

  return (
    <li
      data-slot="chat-entry"
      className={cn('bg-muted/60 text-foreground rounded-md px-3 py-2 text-sm', className)}
      {...props}
    >
      <header className="text-muted-foreground mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide">
        <span className="flex items-center gap-2">
          {name && <strong>{name}</strong>}
          <span className="font-mono text-xs opacity-0 transition-opacity ease-linear group-hover:opacity-100">
            {safeTimestamp ? safeTimestamp.toLocaleTimeString(safeLocale) : ''}
          </span>
        </span>
        {hasBeenEdited && <span>(edited)</span>}
      </header>
      <span className="whitespace-pre-wrap leading-5">{message}</span>
    </li>
  );
};
