import { getSavedResumeActionState } from '../savedResumeActions';

describe('getSavedResumeActionState', () => {
  it('uses the nested resume slug when available', () => {
    expect(getSavedResumeActionState({ resume: { slug: 'nested-slug' } }).slug).toBe('nested-slug');
  });

  it('falls back to the top-level resume slug when nested resume slug is missing', () => {
    expect(getSavedResumeActionState({ resumeSlug: 'top-level-slug', resume: {} }).slug).toBe('top-level-slug');
  });

  it('disables actions when no resume slug is available', () => {
    expect(getSavedResumeActionState({ resumeSlug: '', resume: {} })).toEqual({
      slug: '',
      canView: false,
      canUnsave: false,
    });
  });
});
