'use client';
import React, { Children, cloneElement, isValidElement, memo, useMemo, ReactElement } from 'react';
import { cva } from 'class-variance-authority';
import { useMultibandTrackVolume } from '@livekit/components-react';
import { useAgentAudioVisualizerGridAnimator } from '@/hooks/AgentsUi/use-agent-audio-visualizer-grid';
import { cn } from '@/lib/utils';

function cloneSingleChild(
  children: React.ReactNode,
  props: any,
  key?: string | number,
): React.ReactNode {
  return Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a typescript error too.
    if (isValidElement(child) && Children.only(children)) {
      const childProps = child.props as any;
      let finalProps = { ...props };
      if (childProps.className) {
        // make sure we retain classnames of both passed props and child
        finalProps.className = cn(childProps.className, props.className);
        finalProps.style = {
          ...(childProps.style),
          ...(props.style),
        };
      }
      return cloneElement(child as ReactElement, { ...finalProps, key: key ? String(key) : undefined });
    }
    return child;
  });
}

export const AgentAudioVisualizerGridCellVariants = cva([
  'w-1 h-1 rounded-full bg-current/10 place-self-center transition-all ease-out',
  'data-[lk-highlighted=true]:bg-current',
], {
  variants: {
    size: {
      icon: ['w-[2px] h-[2px]'],
      sm: ['w-[4px] h-[4px]'],
      md: ['w-[8px] h-[8px]'],
      lg: ['w-[12px] h-[12px]'],
      xl: ['w-[16px] h-[16px]'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const AgentAudioVisualizerGridVariants = cva('grid', {
  variants: {
    size: {
      icon: ['gap-[2px]'],
      sm: ['gap-[4px]'],
      md: ['gap-[8px]'],
      lg: ['gap-[12px]'],
      xl: ['gap-[16px]'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const sizeDefaults: Record<string, number> = {
  icon: 3,
  sm: 5,
  md: 5,
  lg: 5,
  xl: 5,
};

function useGrid(
  size: string = 'md',
  columnCount: number = sizeDefaults[size],
  rowCount?: number,
): { columnCount: number; rowCount: number; items: number[] } {
  return useMemo(() => {
    const _columnCount = columnCount;
    const _rowCount = rowCount ?? columnCount;
    const items = new Array(_columnCount * _rowCount).fill(0).map((_, idx) => idx);

    return { columnCount: _columnCount, rowCount: _rowCount, items };
  }, [columnCount, rowCount]);
}

interface GridCellProps {
  index: number;
  state: string;
  interval: number;
  rowCount: number;
  columnCount: number;
  volumeBands: number[];
  highlightedCoordinate: { x: number; y: number };
  children: React.ReactNode;
}

const GridCell = memo(function GridCell({
  index,
  state,
  interval,
  rowCount,
  columnCount,
  volumeBands,
  highlightedCoordinate,
  children
}: GridCellProps) {
  if (state === 'speaking') {
    const y = Math.floor(index / columnCount);
    const rowMidPoint = Math.floor(rowCount / 2);
    const volumeChunks = 1 / (rowMidPoint + 1);
    const distanceToMid = Math.abs(rowMidPoint - y);
    const threshold = distanceToMid * volumeChunks;
    const isHighlighted = (volumeBands[index % columnCount] ?? 0) >= threshold;

    return cloneSingleChild(children, {
      'data-lk-index': index,
      'data-lk-highlighted': isHighlighted,
    });
  }

  const isHighlighted =
    highlightedCoordinate.x === index % columnCount &&
    highlightedCoordinate.y === Math.floor(index / columnCount);

  const transitionDurationInSeconds = interval / (isHighlighted ? 1000 : 100);

  return cloneSingleChild(children, {
    'data-lk-index': index,
    'data-lk-highlighted': isHighlighted,
    style: {
      transitionDuration: `${transitionDurationInSeconds}s`,
    },
  });
});

interface AgentAudioVisualizerGridProps {
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl';
  state?: string;
  radius?: number;
  color?: string;
  rowCount?: number;
  columnCount?: number;
  interval?: number;
  className?: string;
  children?: React.ReactNode;
  audioTrack?: any; // Consider a more specific type if available, e.g., LocalAudioTrack | RemoteAudioTrack
  style?: React.CSSProperties;
  [key: string]: any; // For additional props passed to the div
}

/**
 * A grid-style audio visualizer that responds to agent state and audio levels.
 * Displays an animated grid of cells that react to the current agent state
 * and audio volume when speaking.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentAudioVisualizerGrid
 *   size="md"
 *   state="speaking"
 *   rowCount={5}
 *   columnCount={5}
 *   audioTrack={agentAudioTrack}
 * />
 * ```
 */
export function AgentAudioVisualizerGrid({
  size = 'md',
  state = 'connecting',
  radius,
  color,
  rowCount: _rowCount = 5,
  columnCount: _columnCount = 5,
  interval = 100,
  className,
  children,
  audioTrack,
  style,
  ...props
}: AgentAudioVisualizerGridProps) {
  const { columnCount, rowCount, items } = useGrid(size, _columnCount, _rowCount);
  const highlightedCoordinate = useAgentAudioVisualizerGridAnimator(state as any, rowCount, columnCount, interval, radius);
  const volumeBands = useMultibandTrackVolume(audioTrack, {
    bands: columnCount,
    loPass: 100,
    hiPass: 200,
  });

  if (children && Array.isArray(children)) {
    throw new Error('AgentAudioVisualizerGrid children must be a single element.');
  }

  return (
    <div
      data-lk-state={state}
      className={cn(AgentAudioVisualizerGridVariants({ size }), className)}
      style={
        {
          ...style,
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          color
        }
      }
      {...props}>
      {items.map((idx) => (
        <GridCell
          key={idx}
          index={idx}
          state={state}
          interval={interval}
          rowCount={rowCount}
          columnCount={columnCount}
          volumeBands={volumeBands}
          highlightedCoordinate={highlightedCoordinate}>
          {children ?? <div className={AgentAudioVisualizerGridCellVariants({ size })} />}
        </GridCell>
      ))}
    </div>
  );
}
