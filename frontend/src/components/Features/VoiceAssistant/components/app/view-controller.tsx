'use client';

import { AnimatePresence, LazyMotion, domAnimation, m, type HTMLMotionProps } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/components/Features/VoiceAssistant/app-config';
import { SessionView } from '@/components/Features/VoiceAssistant/components/app/session-view';
import { WelcomeView } from '@/components/Features/VoiceAssistant/components/app/welcome-view';

const MotionWelcomeView = m.create(WelcomeView);
const MotionSessionView = m.create(SessionView);

const VIEW_MOTION_PROPS: HTMLMotionProps<"div"> = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {/* Welcome view */}
        {!isConnected && (
          <MotionWelcomeView
            key="welcome"
            {...VIEW_MOTION_PROPS}
            startButtonText={appConfig.startButtonText}
            onStartCall={start}
          />
        )}
        {/* Session view */}
        {isConnected && (
          <MotionSessionView key="session-view" {...VIEW_MOTION_PROPS} appConfig={appConfig} />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
