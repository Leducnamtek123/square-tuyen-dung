import { useRef, useState, useEffect, useCallback } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useTrackVolume } from '@livekit/components-react';


type AnimatedValue = number | number[];

const DEFAULT_SPEED = 5;
const DEFAULT_AMPLITUDE = 0.025;
const DEFAULT_FREQUENCY = 10;
const DEFAULT_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const;

function useAnimatedValue(initialValue: AnimatedValue) {
  const [value, setValue] = useState(initialValue);
  const motionValue = useMotionValue(initialValue);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  useMotionValueEvent(motionValue, 'change', (nextValue) => setValue(nextValue));

  const animateFn = useCallback(
    (targetValue: AnimatedValue, transition: Record<string, unknown>) => {
      controlsRef.current = animate(
        motionValue as Parameters<typeof animate>[0],
        targetValue as Parameters<typeof animate>[1],
        transition as Parameters<typeof animate>[2]
      );
    },
    [motionValue]
  );

  return { value, controls: controlsRef, animate: animateFn };
}

export function useAgentAudioVisualizerWave({
  state,
  audioTrack,
}: {
  state?: string;
  audioTrack?: unknown;
}) {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const { value: amplitude, animate: animateAmplitude } = useAnimatedValue(DEFAULT_AMPLITUDE);
  const { value: frequency, animate: animateFrequency } = useAnimatedValue(DEFAULT_FREQUENCY);
  const { value: opacity, animate: animateOpacity } = useAnimatedValue(1.0);

  const volume = useTrackVolume(audioTrack as Parameters<typeof useTrackVolume>[0], {
    fftSize: 512,
    smoothingTimeConstant: 0.55,
  });

  useEffect(() => {
    switch (state) {
      case 'disconnected':
        setSpeed(DEFAULT_SPEED);
        animateAmplitude(0, DEFAULT_TRANSITION);
        animateFrequency(0, DEFAULT_TRANSITION);
        animateOpacity(1.0, DEFAULT_TRANSITION);
        return;
      case 'listening':
        setSpeed(DEFAULT_SPEED);
        animateAmplitude(DEFAULT_AMPLITUDE, DEFAULT_TRANSITION);
        animateFrequency(DEFAULT_FREQUENCY, DEFAULT_TRANSITION);
        animateOpacity([1.0, 0.3], {
          duration: 0.75,
          repeat: Infinity,
          repeatType: 'mirror',
        });
        return;
      case 'thinking':
      case 'connecting':
      case 'initializing':
        setSpeed(DEFAULT_SPEED * 4);
        animateAmplitude(DEFAULT_AMPLITUDE / 4, DEFAULT_TRANSITION);
        animateFrequency(DEFAULT_FREQUENCY * 4, DEFAULT_TRANSITION);
        animateOpacity([1.0, 0.3], {
          duration: 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
        });
        return;
      case 'speaking':
      default:
        setSpeed(DEFAULT_SPEED * 2);
        animateAmplitude(DEFAULT_AMPLITUDE, DEFAULT_TRANSITION);
        animateFrequency(DEFAULT_FREQUENCY, DEFAULT_TRANSITION);
        animateOpacity(1.0, DEFAULT_TRANSITION);
        return;
    }
  }, [state, setSpeed, animateAmplitude, animateFrequency, animateOpacity]);

  useEffect(() => {
    if (state === 'speaking') {
      animateAmplitude(0.015 + 0.4 * volume, { duration: 0 });
      animateFrequency(20 + 60 * volume, { duration: 0 });
    }
  }, [state, volume, animateAmplitude, animateFrequency]);

  return {
    speed,
    amplitude,
    frequency,
    opacity,
  };
}

