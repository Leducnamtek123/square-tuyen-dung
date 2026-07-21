import { useRef, useState, useEffect, useCallback } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useTrackVolume } from '@livekit/components-react';


type AnimatedValue = number | number[];
type AnimationTransition = NonNullable<Parameters<typeof animate>[2]>;
type WaveAnimationConfig = {
  speed: number;
  amplitude: AnimatedValue;
  amplitudeTransition: AnimationTransition;
  frequency: AnimatedValue;
  frequencyTransition: AnimationTransition;
  opacity: AnimatedValue;
  opacityTransition: AnimationTransition;
};

const DEFAULT_SPEED = 5;
const DEFAULT_AMPLITUDE = 0.025;
const DEFAULT_FREQUENCY = 10;
const DEFAULT_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const;
const LISTENING_OPACITY_TRANSITION = {
  duration: 0.75,
  repeat: Infinity,
  repeatType: 'mirror',
} as const;
const THINKING_OPACITY_TRANSITION = {
  duration: 0.4,
  repeat: Infinity,
  repeatType: 'mirror',
} as const;

const getWaveAnimationConfig = (state?: string): WaveAnimationConfig => {
  switch (state) {
    case 'disconnected':
      return {
        speed: DEFAULT_SPEED,
        amplitude: 0,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: 0,
        frequencyTransition: DEFAULT_TRANSITION,
        opacity: 1.0,
        opacityTransition: DEFAULT_TRANSITION,
      };
    case 'listening':
      return {
        speed: DEFAULT_SPEED,
        amplitude: DEFAULT_AMPLITUDE,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: DEFAULT_FREQUENCY,
        frequencyTransition: DEFAULT_TRANSITION,
        opacity: [1.0, 0.3],
        opacityTransition: LISTENING_OPACITY_TRANSITION,
      };
    case 'thinking':
    case 'connecting':
    case 'initializing':
      return {
        speed: DEFAULT_SPEED * 4,
        amplitude: DEFAULT_AMPLITUDE / 4,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: DEFAULT_FREQUENCY * 4,
        frequencyTransition: DEFAULT_TRANSITION,
        opacity: [1.0, 0.3],
        opacityTransition: THINKING_OPACITY_TRANSITION,
      };
    case 'speaking':
    default:
      return {
        speed: DEFAULT_SPEED * 2,
        amplitude: DEFAULT_AMPLITUDE,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: DEFAULT_FREQUENCY,
        frequencyTransition: DEFAULT_TRANSITION,
        opacity: 1.0,
        opacityTransition: DEFAULT_TRANSITION,
      };
  }
};

const applyWaveAnimation = (
  config: WaveAnimationConfig,
  controls: {
    animateAmplitude: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
    animateFrequency: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
    animateOpacity: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
  },
) => {
  controls.animateAmplitude(config.amplitude, config.amplitudeTransition);
  controls.animateFrequency(config.frequency, config.frequencyTransition);
  controls.animateOpacity(config.opacity, config.opacityTransition);
};

function useAnimatedValue(initialValue: AnimatedValue) {
  const [value, setValue] = useState(initialValue);
  const motionValue = useMotionValue(initialValue);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  useMotionValueEvent(motionValue, 'change', (nextValue) => setValue(nextValue));

  const animateFn = useCallback(
    (targetValue: AnimatedValue, transition: Parameters<typeof animate>[2]) => {
      controlsRef.current = animate(
        motionValue as Parameters<typeof animate>[0],
        targetValue as Parameters<typeof animate>[1],
        transition
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
  const speed = getWaveAnimationConfig(state).speed;
  const { value: amplitude, animate: animateAmplitude } = useAnimatedValue(DEFAULT_AMPLITUDE);
  const { value: frequency, animate: animateFrequency } = useAnimatedValue(DEFAULT_FREQUENCY);
  const { value: opacity, animate: animateOpacity } = useAnimatedValue(1.0);

  const volume = useTrackVolume(audioTrack as Parameters<typeof useTrackVolume>[0], {
    fftSize: 512,
    smoothingTimeConstant: 0.55,
  });

  useEffect(() => {
    applyWaveAnimation(getWaveAnimationConfig(state), {
      animateAmplitude,
      animateFrequency,
      animateOpacity,
    });
  }, [state, animateAmplitude, animateFrequency, animateOpacity]);

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



