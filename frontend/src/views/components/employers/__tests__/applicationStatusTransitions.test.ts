import {
  canTransitionApplicationStatus,
  getAllowedApplicationStatusTargets,
} from '../applicationStatusTransitions';

describe('application status transitions', () => {
  it('matches the backend application status transition graph', () => {
    expect(getAllowedApplicationStatusTargets(1)).toEqual([2, 6]);
    expect(getAllowedApplicationStatusTargets(2)).toEqual([3, 6]);
    expect(getAllowedApplicationStatusTargets(3)).toEqual([4, 6]);
    expect(getAllowedApplicationStatusTargets(4)).toEqual([5, 6]);
    expect(getAllowedApplicationStatusTargets(5)).toEqual([]);
    expect(getAllowedApplicationStatusTargets(6)).toEqual([]);
  });

  it('allows staying on the current status but rejects skipped transitions', () => {
    expect(canTransitionApplicationStatus(1, 1)).toBe(true);
    expect(canTransitionApplicationStatus(1, 5)).toBe(false);
    expect(canTransitionApplicationStatus(4, 5)).toBe(true);
    expect(canTransitionApplicationStatus(4, 6)).toBe(true);
    expect(canTransitionApplicationStatus(6, 5)).toBe(false);
  });
});
