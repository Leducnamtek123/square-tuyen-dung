import {
  jobPostFilterConfig,
  appliedResumeFilterConfig,
  savedResumeFilterConfig,
  candidateFilterConfig,
} from '../index';

describe('Global Filter Configurations and Schema Parity', () => {
  it('defines jobPostFilterConfig with valid structure and keys', () => {
    expect(jobPostFilterConfig.id).toBe('job-post-filters');
    expect(jobPostFilterConfig.primaryFieldKey).toBe('statusId');
    expect(jobPostFilterConfig.syncWithUrl).toBe(true);
    expect(jobPostFilterConfig.defaultValues).toHaveProperty('kw', '');
    expect(jobPostFilterConfig.defaultValues).toHaveProperty('statusId', '');
    expect(jobPostFilterConfig.defaultValues).toHaveProperty('isUrgent', '');

    const keys = jobPostFilterConfig.fields.map((f) => f.key);
    expect(keys).toContain('kw');
    expect(keys).toContain('statusId');
    expect(keys).toContain('isUrgent');
    expect(keys).toContain('careerId');
    expect(keys).toContain('cityId');
  });

  it('defines appliedResumeFilterConfig with valid structure and keys', () => {
    expect(appliedResumeFilterConfig.id).toBe('applied-resume-filters');
    expect(appliedResumeFilterConfig.primaryFieldKey).toBe('jobPostId');
    expect(appliedResumeFilterConfig.syncWithUrl).toBe(true);
    expect(appliedResumeFilterConfig.defaultValues).toHaveProperty('jobPostId', '');
    expect(appliedResumeFilterConfig.defaultValues).toHaveProperty('applicationStatus', '');
    expect(appliedResumeFilterConfig.defaultValues).toHaveProperty('aiAnalysisStatus', '');

    const keys = appliedResumeFilterConfig.fields.map((f) => f.key);
    expect(keys).toContain('kw');
    expect(keys).toContain('jobPostId');
    expect(keys).toContain('applicationStatus');
    expect(keys).toContain('aiAnalysisStatus');
    expect(keys).toContain('aiScoreMin');
    expect(keys).toContain('cityId');
  });

  it('defines savedResumeFilterConfig with valid structure and keys', () => {
    expect(savedResumeFilterConfig.id).toBe('saved-resume-filters');
    expect(savedResumeFilterConfig.primaryFieldKey).toBe('cityId');
    expect(savedResumeFilterConfig.syncWithUrl).toBe(true);
    expect(savedResumeFilterConfig.defaultValues).toHaveProperty('kw', '');
    expect(savedResumeFilterConfig.defaultValues).toHaveProperty('salaryMax', '');

    const keys = savedResumeFilterConfig.fields.map((f) => f.key);
    expect(keys).toContain('kw');
    expect(keys).toContain('salaryMax');
    expect(keys).toContain('experienceId');
    expect(keys).toContain('cityId');
  });

  it('defines candidateFilterConfig with valid structure and keys', () => {
    expect(candidateFilterConfig.id).toBe('candidate-search-filters');
    expect(candidateFilterConfig.primaryFieldKey).toBe('cityId');
    expect(candidateFilterConfig.syncWithUrl).toBe(true);

    const keys = candidateFilterConfig.fields.map((f) => f.key);
    expect(keys).toContain('careerId');
    expect(keys).toContain('experienceId');
    expect(keys).toContain('positionId');
  });

  it('formats custom labels accurately in filter configs', () => {
    const isUrgentField = jobPostFilterConfig.fields.find((f) => f.key === 'isUrgent');
    expect(isUrgentField?.formatLabel?.('true', [], {})).toBe('Tuyển gấp');
    expect(isUrgentField?.formatLabel?.('false', [], {})).toBe('Bình thường');

    const aiScoreField = appliedResumeFilterConfig.fields.find((f) => f.key === 'aiScoreMin');
    expect(aiScoreField?.formatLabel?.('80', [], {})).toBe('Điểm AI ≥ 80%');

    const salaryField = savedResumeFilterConfig.fields.find((f) => f.key === 'salaryMax');
    expect(salaryField?.formatLabel?.(15000000, [], {})).toContain('15.000.000 VNĐ');
  });
});
