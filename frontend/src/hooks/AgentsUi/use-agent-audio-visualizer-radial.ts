import { useEffect, useRef, useState } from 'react';

import { useMemo } from 'react';

function findGcdLessThan(columns: number, max = columns): number {
  function gcd(a: number, b: number): number {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }
  for (let i = max; i >= 1; i--) {
    if (gcd(columns, i) === i) {
      return i;
    }
  }
  return 1;
}

function generateConnectingSequenceBar(columns: number): number[][] {
  const seq: number[][] = [];
  const center = Math.floor(columns / 2);

  for (let x = 0; x < columns; x++) {
    seq.push([x, (x + center) % columns]);
  }

  return seq;
}

function generateListeningSequenceBar(columns: number): number[][] {
  const divisor = columns > 8 ? columns / findGcdLessThan(columns, 4) : findGcdLessThan(columns, 2);

  return Array.from({ length: divisor }, (_, idx) => [
    ...Array(Math.floor(columns / divisor))
      .fill(1)
      .map((_, idx2) => idx2 * divisor + idx),
  ]);
}

export const useAgentAudioVisualizerRadialAnimator = (
  state: string | undefined,
  barCount: number,
  interval: number
): number[] => {
  const [index, setIndex] = useState(0);

  const sequence = useMemo(() => {
    if (state === 'thinking') {
      return generateListeningSequenceBar(barCount);
    }

    if (state === 'connecting' || state === 'initializing') {
      return generateConnectingSequenceBar(barCount);
    }

    if (state === 'listening') {
      return generateListeningSequenceBar(barCount);
    }

    if (state === undefined || state === 'speaking') {
      return [new Array(barCount).fill(0).map((_, idx) => idx)];
    }

    return [[]];
  }, [state, barCount]);

  const animationFrameId = useRef<number | null>(null);
  useEffect(() => {
    let startTime = performance.now();

    const animate = (time: number) => {
      const timeElapsed = time - startTime;

      if (timeElapsed >= interval) {
        setIndex((prev) => prev + 1);
        startTime = time;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [interval, barCount, state, sequence.length]);

  return sequence[index % sequence.length] ?? [];
};
