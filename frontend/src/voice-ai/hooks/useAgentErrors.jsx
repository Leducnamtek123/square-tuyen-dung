import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { toastAlert } from '@/voice-ai/components/livekit/alert-toast';

export function useAgentErrors() {
  const { t } = useTranslation('interview');
  const agent = useAgent();
  const { isConnected, end } = useSessionContext();

  useEffect(() => {
    if (isConnected && agent.state === 'failed') {
      const reasons = agent.failureReasons;
      console.warn('[LiveKit] agent failed', {
        reasons,
        agentState: agent.state,
        stack: new Error('agent failed').stack,
      });

      toastAlert({
        title: t('voiceAi.agentErrors.title'),
        description: (
          <>
            {reasons.length > 1 && (
              <ul className="list-disc pl-4">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {reasons.length === 1 && <p className="w-full">{reasons[0]}</p>}
            <p className="w-full">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                className="whitespace-nowrap underline"
              >
                {t('voiceAi.agentErrors.quickstart')}
              </a>
              .
            </p>
          </>
        ),
      });

      end();
    }
  }, [agent, isConnected, end]);
}
