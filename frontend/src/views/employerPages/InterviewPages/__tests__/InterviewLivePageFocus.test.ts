import { readFileSync } from 'fs';
import { join } from 'path';

import { countLiveInterviewSessions, getLiveInterviewSessions } from '../liveInterviewSessions';

const readInterviewPageSource = (relativePath: string) =>
  readFileSync(join(__dirname, '..', relativePath), 'utf8');

const readSidebarSource = (relativePath: string) =>
  readFileSync(join(__dirname, '../../../../layouts/components/employers/Sidebar', relativePath), 'utf8');

describe('InterviewLivePage focused live management', () => {
  it('counts only real live interview sessions', () => {
    const sessions = [
      { id: 1, status: 'scheduled' },
      { id: 2, status: 'in_progress' },
      { id: 3, status: 'calibration' },
      { id: 4, status: 'completed' },
      { id: 5, status: ' interrupted ' },
      { id: 6, status: 'cancelled' },
    ];

    expect(getLiveInterviewSessions(sessions).map((session) => session.id)).toEqual([2, 3, 5]);
    expect(countLiveInterviewSessions(sessions)).toBe(3);
  });

  it('does not render summary metric cards on the live interview page', () => {
    const source = readInterviewPageSource('InterviewLivePage.tsx');

    expect(source).not.toContain('interviewLive.stats.inProgressLabel');
    expect(source).not.toContain('interviewLive.stats.scheduledLabel');
    expect(source).not.toContain('interviewLive.stats.completedLabel');
    expect(source).not.toContain('const stats = useMemo');
  });

  it('passes the real live interview count into the sidebar live menu badge', () => {
    const employerMenuSource = readSidebarSource('EmployerMenu.tsx');
    const menuItemSource = readSidebarSource('MenuItem.tsx');

    expect(employerMenuSource).toContain('liveInterviewCount');
    expect(employerMenuSource).toContain('badgeContent={liveInterviewCount}');
    expect(menuItemSource).toContain('badgeContent?: number');
    expect(menuItemSource).toContain('visibleBadgeContent');
  });
});
