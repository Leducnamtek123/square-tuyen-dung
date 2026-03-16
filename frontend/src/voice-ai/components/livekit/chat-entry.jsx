import { useTranslation } from 'react-i18next';
import { cn } from '@/voice-ai/lib/utils';

export const ChatEntry = ({
  className,
  locale,
  timestamp,
  message,
  name,
  isLocal,
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
        'flex flex-col gap-1 px-4 py-1',
        isLocal ? 'items-end' : 'items-start',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300',
          isLocal
            ? 'rounded-tr-none bg-linear-to-br from-sky-500 to-indigo-600 text-white'
            : 'rounded-tl-none border border-white/10 bg-white/10 text-slate-100 backdrop-blur-md',
          'max-w-[85%] md:max-w-[70%]'
        )}
      >
        <header className="mb-0.5 flex items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-widest opacity-70">
          <div className="flex items-center gap-1.5">
            {name && <span className="text-white/90">{name}</span>}
            <span className="font-mono text-[9px] font-medium opacity-60">
              {safeTimestamp ? safeTimestamp.toLocaleTimeString(safeLocale, { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
          {hasBeenEdited && <span className="text-[8px] italic">({t('chatEdited', { defaultValue: 'edited' })})</span>}
        </header>
        <span className="whitespace-pre-wrap leading-6 tracking-wide">{message}</span>
        
        {/* Subtle tail/indicator for bubble */}
        <div 
          className={cn(
            "absolute top-0 h-2 w-2",
            isLocal 
              ? "-right-1 bg-indigo-600 [clip-path:polygon(0_0,0_100%,100%_0)]" 
              : "-left-1 bg-white/10 border-l border-t border-white/5 [clip-path:polygon(0_0,100%_0,100%_100%)]"
          )}
        />
      </div>
    </li>
  );
};
