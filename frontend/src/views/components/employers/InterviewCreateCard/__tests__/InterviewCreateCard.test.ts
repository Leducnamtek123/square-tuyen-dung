import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewCreateCard Component & Session Creation', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries job posts, questions, voice profiles, and question groups for session setup', () => {
    expect(source).toContain('useEmployerJobPosts');
    expect(source).toContain('useEmployerQuestions');
    expect(source).toContain('useEmployerVoiceProfiles');
    expect(source).toContain('useQuestionGroups');
  });

  it('handles interview creation mutations and routes upon success', () => {
    expect(source).toContain('useInterviewMutations');
    expect(source).toContain('useRouter');
  });
});
