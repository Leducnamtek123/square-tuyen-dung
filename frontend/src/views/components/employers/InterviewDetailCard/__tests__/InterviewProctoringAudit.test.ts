import { readFileSync } from 'fs';
import { join } from 'path';

describe('Interview Proctoring Audit Integration', () => {
  const infoCardSource = readFileSync(join(__dirname, '../InterviewInfoCard.tsx'), 'utf8');
  const analysisPanelSource = readFileSync(join(__dirname, '../InterviewAnalysisPanel.tsx'), 'utf8');

  it('InterviewInfoCard includes proctoring / anti-cheat monitoring indicator', () => {
    expect(infoCardSource).toContain('Giám sát / Chống gian lận');
    expect(infoCardSource).toContain('proctoringViolationCount');
    expect(infoCardSource).toContain('Hoàn hảo (0 cảnh báo)');
  });

  it('InterviewAnalysisPanel renders full proctoring audit section with event breakdown', () => {
    expect(analysisPanelSource).toContain('Biên bản giám sát & Tính toàn vẹn (AI Proctoring Audit)');
    expect(analysisPanelSource).toContain('Mức độ tuân thủ');
    expect(analysisPanelSource).toContain('Số lần cảnh báo rời màn hình');
    expect(analysisPanelSource).toContain('Tổng thời gian rời tab');
    expect(analysisPanelSource).toContain('proctoringEvents');
  });
});
