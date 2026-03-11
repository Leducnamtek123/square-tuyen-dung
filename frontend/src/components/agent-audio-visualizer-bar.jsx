'use client';;
import React, { Children, cloneElement, isValidElement, useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { useMultibandTrackVolume } from '@livekit/components-react';
import { useAgentAudioVisualizerBarAnimator } from '@/hooks/use-agent-audio-visualizer-bar';
import { cn } from '@/lib/utils';

function cloneSingleChild(
  children,
  props,
  key,
) {
  return Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a typescript error too.
    if (isValidElement(child) && Children.only(children)) {
      const childProps = child.props;
      if (childProps.className) {
        // make sure we retain classnames of both passed props and child
        props ??= {};
        props.className = cn(childProps.className, props.className);
        props.style = {
          ...(childProps.style),
          ...(props.style),
        };
      }
      return cloneElement(child, { ...props, key: key ? String(key) : undefined });
    }
    return child;
  });
}

export const AgentAudioVisualizerBarElementVariants = cva([
  'rounded-full transition-colors duration-250 ease-linear',
  'bg-current/10 data-[lk-highlighted=true]:bg-current',
], {
  variants: {
    size: {
      icon: 'w-[4px] min-h-[4px]',
      sm: 'w-[8px] min-h-[8px]',
      md: 'w-[16px] min-h-[16px]',
      lg: 'w-[32px] min-h-[32px]',
      xl: 'w-[64px] min-h-[64px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const AgentAudioVisualizerBarVariants = cva('relative flex items-center justify-center', {
  variants: {
    size: {
      icon: 'h-[24px] gap-[2px]',
      sm: 'h-[56px] gap-[4px]',
      md: 'h-[112px] gap-[8px]',
      lg: 'h-[224px] gap-[16px]',
      xl: 'h-[448px] gap-[32px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * A bar-style audio visualizer that responds to agent state and audio levels.
 * Displays animated bars that react to the current agent state (connecting, thinking, speaking, etc.)
 * and audio volume when speaking.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentAudioVisualizerBar
 *   size="md"
 *   state="speaking"
 *   audioTrack={agentAudioTrack}
 * />
 * ```
 */
export function AgentAudioVisualizerBar({
  size = 'md',
  state = 'connecting',
  color,
  barCount,
  audioTrack,
  className,
  children,
  style,
  ...props
}) {
  const _barCount = useMemo(() => {
    if (barCount) {
      return barCount;
    }
    switch (size) {
      case 'icon':
      case 'sm':
        return 3;
      default:
        return 5;
    }
  }, [barCount, size]);

  const volumeBands = useMultibandTrackVolume(audioTrack, {
    bands: _barCount,
    loPass: 100,
    hiPass: 200,
  });

  const sequencerInterval = useMemo(() => {
    switch (state) {
      case 'connecting':
        return 2000 / _barCount;
      case 'initializing':
        return 2000;
      case 'listening':
        return 500;
      case 'thinking':
        return 150;
      default:
        return 1000;
    }
  }, [state, _barCount]);

  const highlightedIndices = useAgentAudioVisualizerBarAnimator(state, _barCount, sequencerInterval);

  const bands = useMemo(
    () => (state === 'speaking' ? volumeBands : new Array(_barCount).fill(0)),
    [state, volumeBands, _barCount]
  );

  if (children && Array.isArray(children)) {
    throw new Error('AgentAudioVisualizerBar children must be a single element.');
  }

  return (
    <div
      data-lk-state={state}
      style={{
        ...style,
        color
      }}
      className={cn(AgentAudioVisualizerBarVariants({ size }), className)}
      {...props}>
      {bands.map((band, idx) =>
        children ? (
          <React.Fragment key={idx}>
            {cloneSingleChild(children, {
              'data-lk-index': idx,
              'data-lk-highlighted': highlightedIndices.includes(idx),
              style: { height: `${band * 100}%` },
            })}
          </React.Fragment>
        ) : (
          <div
            key={idx}
            data-lk-index={idx}
            data-lk-highlighted={highlightedIndices.includes(idx)}
            style={{ height: `${band * 100}%` }}
            className={cn(AgentAudioVisualizerBarElementVariants({ size }))} />
        ))}
    </div>
  );
}
