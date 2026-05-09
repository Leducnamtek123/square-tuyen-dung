import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Features/VoiceAssistant/components/livekit/button';

function WelcomeImage() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-fg0 mb-4 size-16"
    >
      <rect x="9" y="21" width="6" height="22" rx="3" fill="currentColor" />
      <rect x="19" y="5" width="6" height="54" rx="3" fill="currentColor" />
      <rect x="29" y="13" width="6" height="38" rx="3" fill="currentColor" />
      <rect x="39" y="21" width="6" height="22" rx="3" fill="currentColor" />
      <rect x="49" y="17" width="6" height="30" rx="3" fill="currentColor" />
    </svg>
  );
}

interface WelcomeViewProps {
  startButtonText?: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const { t } = useTranslation('voiceAssistant');
  const startLabel = startButtonText || t('startCall');

  return (
    <div ref={ref}>
      <section className="bg-background flex flex-col items-center justify-center text-center">
        <WelcomeImage />

        <p className="text-foreground max-w-prose pt-1 leading-6 font-medium">
          {t('welcomeMessage')}
        </p>

        <Button variant="primary" size="lg" onClick={onStartCall} className="mt-6 w-64 font-mono">
          {startLabel}
        </Button>
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          {t('setupHelpPrefix')}{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            {t('setupHelpLink')}
          </a>
          .
        </p>
      </div>
    </div>
  );
};
