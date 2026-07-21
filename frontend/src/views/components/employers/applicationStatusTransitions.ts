const APPLICATION_STATUS_TRANSITIONS: Record<number, number[]> = {
  1: [2, 6],
  2: [3, 6],
  3: [4, 6],
  4: [5, 6],
  5: [],
  6: [],
};

export const getAllowedApplicationStatusTargets = (currentStatus?: number | null): number[] => (
  APPLICATION_STATUS_TRANSITIONS[Number(currentStatus)] || []
);

export const canTransitionApplicationStatus = (
  currentStatus?: number | null,
  nextStatus?: number | null,
): boolean => {
  const current = Number(currentStatus);
  const next = Number(nextStatus);
  if (!Number.isInteger(current) || !Number.isInteger(next)) return false;
  if (current === next) return true;
  return getAllowedApplicationStatusTargets(current).includes(next);
};
