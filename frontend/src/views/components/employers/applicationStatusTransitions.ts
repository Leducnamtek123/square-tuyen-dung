const APPLICATION_STATUS_TRANSITIONS: Record<number, number[]> = {
  1: [2, 3, 4, 5, 6],
  2: [1, 3, 4, 5, 6],
  3: [2, 4, 5, 6],
  4: [3, 5, 6],
  5: [4, 6],
  6: [1, 2, 4],
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
