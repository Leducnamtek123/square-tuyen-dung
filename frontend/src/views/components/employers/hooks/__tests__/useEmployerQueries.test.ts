const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  keepPreviousData: Symbol('keepPreviousData'),
  useQuery: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: mockInvalidateQueries,
  })),
  useMutation: jest.fn((config) => ({
    mutateAsync: async (input: unknown) => {
      const result = await config.mutationFn(input);
      config.onSuccess?.(result, input, undefined);
      return result;
    },
    isPending: false,
  })),
}));

jest.mock('../../../../../services/jobService', () => ({
  __esModule: true,
  default: {
    addJobPost: jest.fn(async () => ({ id: 1 })),
    updateJobPostById: jest.fn(async () => ({ id: 1 })),
    deleteJobPostById: jest.fn(async () => undefined),
    getEmployerJobPostOptions: jest.fn(),
  },
}));

import jobService from '../../../../../services/jobService';
import { normalizeJobPostOptions, useJobPostMutations } from '../useEmployerQueries';

describe('normalizeJobPostOptions', () => {
  it('accepts backend raw array response', () => {
    expect(normalizeJobPostOptions([{ id: 1, jobName: 'Frontend Developer' }])).toEqual([
      { id: 1, jobName: 'Frontend Developer' },
    ]);
  });

  it('accepts paginated results and legacy statusOptions response shapes', () => {
    expect(normalizeJobPostOptions({ results: [{ id: 2, name: 'Backend Developer' }] })).toEqual([
      { id: 2, jobName: 'Backend Developer' },
    ]);
    expect(normalizeJobPostOptions({ statusOptions: [{ id: 3, name: 'QA Engineer' }] })).toEqual([
      { id: 3, jobName: 'QA Engineer' },
    ]);
  });

  it('accepts data envelope response shape', () => {
    expect(normalizeJobPostOptions({ data: [{ id: 4, jobName: 'Product Manager' }] })).toEqual([
      { id: 4, jobName: 'Product Manager' },
    ]);
  });

  it('accepts nested data results response shape', () => {
    expect(normalizeJobPostOptions({ data: { results: [{ id: 5, jobName: 'Site Supervisor' }] } })).toEqual([
      { id: 5, jobName: 'Site Supervisor' },
    ]);
  });
});

describe('useJobPostMutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates job post options after create, update, and delete', async () => {
    const { addJobPost, updateJobPost, deleteJobPost } = useJobPostMutations();

    await addJobPost({ jobName: 'Frontend Developer' } as never);
    await updateJobPost({ id: 1, data: { jobName: 'Senior Frontend Developer' } as never });
    await deleteJobPost(1);

    expect(jobService.addJobPost).toHaveBeenCalledWith({ jobName: 'Frontend Developer' });
    expect(jobService.updateJobPostById).toHaveBeenCalledWith(1, { jobName: 'Senior Frontend Developer' });
    expect(jobService.deleteJobPostById).toHaveBeenCalledWith(1);

    const invalidatedKeys = mockInvalidateQueries.mock.calls.map(([arg]) => arg.queryKey.join(':'));
    expect(invalidatedKeys.filter((key) => key === 'employerJobPosts')).toHaveLength(3);
    expect(invalidatedKeys.filter((key) => key === 'jobPostOptions')).toHaveLength(3);
  });
});
