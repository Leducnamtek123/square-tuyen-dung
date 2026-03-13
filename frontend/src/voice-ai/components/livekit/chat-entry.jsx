import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('interview');
  const safeLocale = (() => {
    if (typeof locale !== 'string' || !locale) {
      return undefined;
    }
    if (!Intl?.DateTimeFormat?.supportedLocalesOf) {
      return undefined;
    }
    try {
      return Intl.DateTimeFormat.supportedLocalesOf(locale).length ? locale : undefined;
    } catch {
      return undefined;
    }
  })();
  const safeTimestamp =
    typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp) : null;

  return (
    <li
      data-slot="chat-entry"
      className={cn(
        'rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 shadow-[0_8px_22px_rgba(2,6,23,0.25)]',
        className
      )}
      {...props}
    >
      <header className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-white/50">
        <span className="flex items-center gap-2">
          {name && <strong>{name}</strong>}
          <span className="font-mono text-xs opacity-0 transition-opacity ease-linear group-hover:opacity-100">
            {safeTimestamp ? safeTimestamp.toLocaleTimeString(safeLocale) : ''}
          </span>
        </span>
        {hasBeenEdited && <span>({t('chatEdited', { defaultValue: 'edited' })})</span>}
      </header>
      <span className="whitespace-pre-wrap leading-5">{message}</span>
    </li>
  );
};
