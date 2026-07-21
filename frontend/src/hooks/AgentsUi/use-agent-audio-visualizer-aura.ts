import { useEffect, useRef, useState, useCallback } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useTrackVolume } from '@livekit/components-react';


type AnimatedValue = number | number[];
type AnimationTransition = NonNullable<Parameters<typeof animate>[2]>;
type AuraAnimationConfig = {
  speed: number;
  scale: AnimatedValue;
  scaleTransition: AnimationTransition;
  amplitude: AnimatedValue;
  amplitudeTransition: AnimationTransition;
  frequency: AnimatedValue;
  frequencyTransition: AnimationTransition;
  brightness: AnimatedValue;
  brightnessTransition: AnimationTransition;
};

const DEFAULT_SPEED = 10;
const DEFAULT_AMPLITUDE = 2;
const DEFAULT_FREQUENCY = 0.5;
const DEFAULT_SCALE = 0.2;
const DEFAULT_BRIGHTNESS = 1.5;
const DEFAULT_TRANSITION = { duration: 0.5, ease: 'easeOut' } as const;
const DEFAULT_PULSE_TRANSITION = {
  duration: 0.35,
  ease: 'easeOut',
  repeat: Infinity,
  repeatType: 'mirror',
} as const;
const LISTENING_SCALE_TRANSITION = { type: 'spring', duration: 1.0, bounce: 0.35 } as const;

const getAuraAnimationConfig = (state?: string): AuraAnimationConfig | null => {
  switch (state) {
    case 'idle':
    case 'failed':
    case 'disconnected':
      return {
        speed: 10,
        scale: 0.2,
        scaleTransition: DEFAULT_TRANSITION,
        amplitude: 1.2,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: 0.4,
        frequencyTransition: DEFAULT_TRANSITION,
        brightness: 1.0,
        brightnessTransition: DEFAULT_TRANSITION,
      };
    case 'listening':
    case 'pre-connect-buffering':
      return {
        speed: 20,
        scale: 0.3,
        scaleTransition: LISTENING_SCALE_TRANSITION,
        amplitude: 1.0,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: 0.7,
        frequencyTransition: DEFAULT_TRANSITION,
        brightness: [1.5, 2.0],
        brightnessTransition: DEFAULT_PULSE_TRANSITION,
      };
    case 'thinking':
    case 'connecting':
    case 'initializing':
      return {
        speed: 30,
        scale: 0.3,
        scaleTransition: DEFAULT_TRANSITION,
        amplitude: 0.5,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: 1,
        frequencyTransition: DEFAULT_TRANSITION,
        brightness: [0.5, 2.5],
        brightnessTransition: DEFAULT_PULSE_TRANSITION,
      };
    case 'speaking':
      return {
        speed: 70,
        scale: 0.3,
        scaleTransition: DEFAULT_TRANSITION,
        amplitude: 0.75,
        amplitudeTransition: DEFAULT_TRANSITION,
        frequency: 1.25,
        frequencyTransition: DEFAULT_TRANSITION,
        brightness: 1.5,
        brightnessTransition: DEFAULT_TRANSITION,
      };
    default:
      return null;
  }
};

const applyAuraAnimation = (
  config: AuraAnimationConfig,
  controls: {
    animateScale: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
    animateAmplitude: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
    animateFrequency: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
    animateBrightness: (targetValue: AnimatedValue, transition: AnimationTransition) => void;
  },
) => {
  controls.animateScale(config.scale, config.scaleTransition);
  controls.animateAmplitude(config.amplitude, config.amplitudeTransition);
  controls.animateFrequency(config.frequency, config.frequencyTransition);
  controls.animateBrightness(config.brightness, config.brightnessTransition);
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

  return { value, motionValue, controls: controlsRef, animate: animateFn };
}

export function useAgentAudioVisualizerAura(
  state: string | undefined,
  audioTrack: unknown
) {
  const speed = getAuraAnimationConfig(state)?.speed ?? DEFAULT_SPEED;
  const {
    value: scale,
    animate: animateScale,
    motionValue: scaleMotionValue,
  } = useAnimatedValue(DEFAULT_SCALE);
  const { value: amplitude, animate: animateAmplitude } = useAnimatedValue(DEFAULT_AMPLITUDE);
  const { value: frequency, animate: animateFrequency } = useAnimatedValue(DEFAULT_FREQUENCY);
  const { value: brightness, animate: animateBrightness } = useAnimatedValue(DEFAULT_BRIGHTNESS);

  // Note: We can't call hooks conditionally, so we expect the caller 
  // to ensure context or handle the error if this hook is used outside of Room.
  // However, we'll try to be safe by checking if audioTrack exists.
  const trackVolume = useTrackVolume(audioTrack as Parameters<typeof useTrackVolume>[0], {
    fftSize: 512,
    smoothingTimeConstant: 0.55,
  });
  const volume = audioTrack ? trackVolume : 0;

  useEffect(() => {
    const animationConfig = getAuraAnimationConfig(state);
    if (animationConfig) {
      applyAuraAnimation(animationConfig, {
        animateScale,
        animateAmplitude,
        animateFrequency,
        animateBrightness,
      });
    }
  }, [state, animateScale, animateAmplitude, animateFrequency, animateBrightness]);

  useEffect(() => {
    if (state === 'speaking' && volume > 0 && !scaleMotionValue.isAnimating()) {
      animateScale(0.2 + 0.2 * volume, { duration: 0 });
    }
  }, [
    state,
    volume,
    scaleMotionValue,
    animateScale,
    animateAmplitude,
    animateFrequency,
    animateBrightness,
  ]);

  return {
    speed,
    scale,
    amplitude,
    frequency,
    brightness,
  };
}



