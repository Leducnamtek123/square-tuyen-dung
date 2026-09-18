import { readFileSync } from 'fs';
import { join } from 'path';

describe('Interview Video Recording Integration for Candidate Views', () => {
  const modalFile = join(__dirname, '../components/CandidateEvaluationModal.tsx');
  const completedViewFile = join(
    __dirname,
    '../../../interviewPages/components/InterviewCompletedView.tsx'
  );

  it('verifies that CandidateEvaluationModal includes video recording player for both mock and official sessions', () => {
    const content = readFileSync(modalFile, 'utf8');
    expect(content).toContain('getSafeResourceUrl');
    expect(content).toContain('safeRecordingUrl');
    expect(content).toContain('VideoLibraryOutlinedIcon');
    expect(content).toContain('OpenInNewRoundedIcon');
    expect(content).toContain("isMock ? 'Bản ghi video luyện tập AI' : 'Bản ghi video phỏng vấn'");
    expect(content).toContain('component="video"');
    expect(content).toContain('Video ghi hình đang được hệ thống đồng bộ');
  });

  it('verifies that InterviewCompletedView includes video recording player for post-interview review', () => {
    const content = readFileSync(completedViewFile, 'utf8');
    expect(content).toContain('getSafeResourceUrl');
    expect(content).toContain('safeRecordingUrl');
    expect(content).toContain('VideoLibraryOutlinedIcon');
    expect(content).toContain('OpenInNewRoundedIcon');
    expect(content).toContain("isMock ? 'Bản ghi video luyện tập AI' : 'Bản ghi video phỏng vấn'");
    expect(content).toContain('<video');
    expect(content).toContain('Video ghi hình đang được hệ thống đồng bộ');
  });
});
