import { useEffect, useRef, useState, useCallback } from 'react';
import { type LocalAudioTrack, type RemoteAudioTrack } from 'livekit-client';
import {
  type AnimationPlaybackControlsWithThen,
  type ValueAnimationTransition,
  animate,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import {
  type AgentState,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
  useTrackVolume,
} from '@livekit/components-react';

const DEFAULT_SPEED = 10;
const DEFAULT_AMPLITUDE = 2;
const DEFAULT_FREQUENCY = 0.5;
const DEFAULT_SCALE = 0.2;
const DEFAULT_BRIGHTNESS = 1.5;
const DEFAULT_TRANSITION: ValueAnimationTransition = { duration: 0.5, ease: 'easeOut' };
const DEFAULT_PULSE_TRANSITION: ValueAnimationTransition = {
  duration: 0.35,
  ease: 'easeOut',
  repeat: Infinity,
  repeatType: 'mirror',
};
const LISTENING_SCALE_TRANSITION: ValueAnimationTransition = {
  type: 'spring',
  duration: 1.0,
  bounce: 0.35,
};

type AnimatedNumber = number | number[];
type AuraAnimationConfig = {
  speed: number;
  scale: AnimatedNumber;
  scaleTransition: ValueAnimationTransition;
  amplitude: AnimatedNumber;
  amplitudeTransition: ValueAnimationTransition;
  frequency: AnimatedNumber;
  frequencyTransition: ValueAnimationTransition;
  brightness: AnimatedNumber;
  brightnessTransition: ValueAnimationTransition;
};

const getAuraAnimationConfig = (state: AgentState | undefined): AuraAnimationConfig | null => {
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
    animateScale: (targetValue: AnimatedNumber, transition: ValueAnimationTransition) => void;
    animateAmplitude: (targetValue: AnimatedNumber, transition: ValueAnimationTransition) => void;
    animateFrequency: (targetValue: AnimatedNumber, transition: ValueAnimationTransition) => void;
    animateBrightness: (targetValue: AnimatedNumber, transition: ValueAnimationTransition) => void;
  },
) => {
  controls.animateScale(config.scale, config.scaleTransition);
  controls.animateAmplitude(config.amplitude, config.amplitudeTransition);
  controls.animateFrequency(config.frequency, config.frequencyTransition);
  controls.animateBrightness(config.brightness, config.brightnessTransition);
};

function useAnimatedValue<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const motionValue = useMotionValue(initialValue);
  const controlsRef = useRef<AnimationPlaybackControlsWithThen | null>(null);
  useMotionValueEvent(motionValue, 'change', (value) => setValue(value as T));

  const animateFn = useCallback(
    (targetValue: T | T[], transition: ValueAnimationTransition) => {
      controlsRef.current = animate(motionValue, targetValue, transition);
    },
    [motionValue],
  );

  return { value, motionValue, controls: controlsRef, animate: animateFn };
}

export function useAgentAudioVisualizerAura(
  state: AgentState | undefined,
  audioTrack?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder,
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

  const volume = useTrackVolume(audioTrack as TrackReference, {
    fftSize: 512,
    smoothingTimeConstant: 0.55,
  });

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
