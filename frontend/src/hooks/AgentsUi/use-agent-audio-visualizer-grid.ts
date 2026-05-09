import { useEffect, useState } from 'react';

import { useMemo } from 'react';

type Point = { x: number; y: number };

export function generateConnectingSequence(rows: number, columns: number, radius: number): Point[] {
  const seq: Point[] = [];
  const centerY = Math.floor(rows / 2);

  // Calculate the boundaries of the ring based on the ring distance
  const topLeft = {
    x: Math.max(0, centerY - radius),
    y: Math.max(0, centerY - radius),
  };
  const bottomRight = {
    x: columns - 1 - topLeft.x,
    y: Math.min(rows - 1, centerY + radius),
  };

  // Top edge
  for (let x = topLeft.x; x <= bottomRight.x; x++) {
    seq.push({ x, y: topLeft.y });
  }

  // Right edge
  for (let y = topLeft.y + 1; y <= bottomRight.y; y++) {
    seq.push({ x: bottomRight.x, y });
  }

  // Bottom edge
  for (let x = bottomRight.x - 1; x >= topLeft.x; x--) {
    seq.push({ x, y: bottomRight.y });
  }

  // Left edge
  for (let y = bottomRight.y - 1; y > topLeft.y; y--) {
    seq.push({ x: topLeft.x, y });
  }

  return seq;
}

export function generateListeningSequence(rows: number, columns: number): Point[] {
  const center = { x: Math.floor(columns / 2), y: Math.floor(rows / 2) };
  const noIndex = { x: -1, y: -1 };

  return [center, noIndex, noIndex, noIndex, noIndex, noIndex, noIndex, noIndex, noIndex];
}

export function generateThinkingSequence(rows: number, columns: number): Point[] {
  const seq: Point[] = [];
  const y = Math.floor(rows / 2);
  for (let x = 0; x < columns; x++) {
    seq.push({ x, y });
  }
  for (let x = columns - 1; x >= 0; x--) {
    seq.push({ x, y });
  }

  return seq;
}

export function useAgentAudioVisualizerGridAnimator(
  state: string | undefined,
  rows: number,
  columns: number,
  interval: number,
  radius?: number
): Point {
  const [index, setIndex] = useState(0);

  const sequence = useMemo(() => {
    const clampedRadius = radius
      ? Math.min(radius, Math.floor(Math.max(rows, columns) / 2))
      : Math.floor(Math.max(rows, columns) / 2);

    if (state === 'thinking') {
      return generateThinkingSequence(rows, columns);
    }

    if (state === 'connecting' || state === 'initializing') {
      return [...generateConnectingSequence(rows, columns, clampedRadius)];
    }

    if (state === 'listening') {
      return generateListeningSequence(rows, columns);
    }

    return [{ x: Math.floor(columns / 2), y: Math.floor(rows / 2) }];
  }, [state, rows, columns, radius]);

  useEffect(() => {
    if (state === 'speaking') {
      return;
    }

    const indexInterval = setInterval(() => {
      setIndex((prev) => {
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(indexInterval);
  }, [interval, columns, rows, state, sequence.length]);

  return sequence[index % sequence.length] ?? {
    x: Math.floor(columns / 2),
    y: Math.floor(rows / 2),
  };
}
