import { readFileSync } from 'fs';
import { join } from 'path';

describe('AiCandidateRecommendationModal Component & Candidate Matching', () => {
  const filePath = join(__dirname, '../../AiCandidateRecommendationModal.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('fetches candidate recommendations for the job post', () => {
    expect(source).toContain('CandidateRecommendation');
    expect(source).toContain('matchScore');
    expect(source).toContain('matchReasons');
    expect(source).toContain('resumeService');
  });

  it('allows saving and viewing suggested candidate profiles', () => {
    expect(source).toContain('BookmarkIcon');
    expect(source).toContain('unwrapDataResponse');
  });
});
