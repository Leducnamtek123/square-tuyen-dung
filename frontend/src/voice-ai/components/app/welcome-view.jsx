import { useTranslation } from 'react-i18next';
import { Button } from '@/voice-ai/components/livekit/button';

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
      <path
        d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WelcomeView({ startButtonText, onStartCall }) {
  const { t } = useTranslation('interview');
  const ctaLabel = startButtonText || t('startInterview');
  return (
    <div className="relative min-h-svh overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-[-10%] h-96 w-[36rem] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.85),rgba(2,6,23,0.95))]" />
      </div>

      <section className="relative mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          {t('readyTitle')}
        </div>

        <div className="mb-6 flex flex-col items-center">
          <WelcomeImage />
          <h1 className="mt-3 text-balance text-4xl font-semibold text-white md:text-5xl">
            {t('voiceAi.welcome.subtitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/70 md:text-lg">
            {t('readyBody')}
          </p>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full max-w-xs rounded-full bg-white text-slate-900 text-base font-semibold shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:bg-white/90 focus:bg-white/90"
            onClick={onStartCall}
          >
            {ctaLabel}
          </Button>
          <p className="text-xs text-white/50 md:text-sm">{t('voiceAi.welcome.help')}</p>
        </div>

        <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
          {[
            { title: t('controls.mic'), body: t('readyBody') },
            { title: t('controls.camera'), body: t('readyBody') },
            { title: t('controls.chat'), body: t('readyBody') },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-white/80 shadow-lg shadow-black/20"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                {item.title}
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative mx-auto flex w-full justify-center px-6 pb-8 text-center">
        <p className="text-muted-foreground max-w-prose text-xs leading-5 md:text-sm">
          {t('voiceAi.welcome.help')}{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline underline-offset-4"
          >
            {t('voiceAi.welcome.quickstart')}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
