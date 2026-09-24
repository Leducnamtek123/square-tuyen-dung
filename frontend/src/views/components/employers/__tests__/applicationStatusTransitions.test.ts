import {
  canTransitionApplicationStatus,
  getAllowedApplicationStatusTargets,
} from '../applicationStatusTransitions';

describe('application status transitions', () => {
  it('matches the backend application status transition graph', () => {
    expect(getAllowedApplicationStatusTargets(1)).toEqual([2, 3, 4, 5, 6]);
    expect(getAllowedApplicationStatusTargets(2)).toEqual([1, 3, 4, 5, 6]);
    expect(getAllowedApplicationStatusTargets(3)).toEqual([2, 4, 5, 6]);
    expect(getAllowedApplicationStatusTargets(4)).toEqual([3, 5, 6]);
    expect(getAllowedApplicationStatusTargets(5)).toEqual([4, 6]);
    expect(getAllowedApplicationStatusTargets(6)).toEqual([1, 2, 4]);
  });

  it('allows staying on the current status and supports flexible transitions and recovery', () => {
    expect(canTransitionApplicationStatus(1, 1)).toBe(true);
    expect(canTransitionApplicationStatus(1, 4)).toBe(true);
    expect(canTransitionApplicationStatus(1, 5)).toBe(true);
    expect(canTransitionApplicationStatus(4, 5)).toBe(true);
    expect(canTransitionApplicationStatus(4, 6)).toBe(true);
    expect(canTransitionApplicationStatus(6, 1)).toBe(true);
    expect(canTransitionApplicationStatus(6, 2)).toBe(true);
    expect(canTransitionApplicationStatus(6, 5)).toBe(false);
  });
});
