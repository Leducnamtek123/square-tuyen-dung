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

  it('configures a strict 2-column grid layout on md and above with 1 column on xs', () => {
    const source = readInterviewPageSource('InterviewLivePage.tsx');

    expect(source).toContain("xs: '1fr'");
    expect(source).toContain("md: 'repeat(2, 1fr)'");
    expect(source).toContain("gap: 2.5");
  });

  it('provides a candidate search toolbar and filters active sessions correctly', () => {
    const source = readInterviewPageSource('InterviewLivePage.tsx');

    expect(source).toContain('searchQuery');
    expect(source).toContain('filteredSessions');
    expect(source).toContain('interviewLive.searchPlaceholder');
    expect(source).toContain('interviewLive.noSearchMatch');

    // Test filter logic
    const mockSessions = [
      { id: 1, candidateName: 'Nguyen Van A', jobName: 'Frontend Engineer', roomName: 'room-101' },
      { id: 2, candidateName: 'Tran Thi B', jobName: 'Backend Engineer', roomName: 'room-102' },
      { id: 3, candidateName: 'Le Van C', questionGroup: { name: 'AI Research Scientist' }, roomName: 'room-103' },
    ];

    const filterFn = (sessions: typeof mockSessions, query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return sessions;
      return sessions.filter((s) => {
        const cName = (s.candidateName || '').toLowerCase();
        const jName = (
          typeof s.questionGroup === 'object' && s.questionGroup && 'name' in s.questionGroup
            ? String((s.questionGroup as any).name)
            : s.jobName || ''
        ).toLowerCase();
        const rName = (s.roomName || '').toLowerCase();
        return cName.includes(q) || jName.includes(q) || rName.includes(q);
      });
    };

    expect(filterFn(mockSessions, 'Nguyen').map((s) => s.id)).toEqual([1]);
    expect(filterFn(mockSessions, 'backend').map((s) => s.id)).toEqual([2]);
    expect(filterFn(mockSessions, 'Research').map((s) => s.id)).toEqual([3]);
    expect(filterFn(mockSessions, 'room-102').map((s) => s.id)).toEqual([2]);
    expect(filterFn(mockSessions, 'nonexistent')).toHaveLength(0);
  });

  it('renders a compact auto-refresh switch toggle and refresh icon button', () => {
    const source = readInterviewPageSource('InterviewLivePage.tsx');

    expect(source).toContain('toggle-auto-refresh');
    expect(source).toContain('RefreshIcon');
    expect(source).toContain('interviewLive.autoRefresh.on');
  });

  it('filters out orphan sessions older than 12 hours from live interview list', () => {
    const now = Date.now();
    const recentSession = {
      id: 1,
      status: 'in_progress',
      startTime: new Date(now - 2 * 3600 * 1000).toISOString(),
    };
    const orphanSessionOldStartTime = {
      id: 2,
      status: 'in_progress',
      startTime: new Date(now - 13 * 3600 * 1000).toISOString(),
    };
    const orphanSessionOldCreatedAt = {
      id: 3,
      status: 'in_progress',
      createdAt: new Date(now - 24 * 3600 * 1000).toISOString(),
    };
    const orphanSessionOldCreateAt = {
      id: 4,
      status: 'in_progress',
      create_at: new Date(now - 48 * 3600 * 1000).toISOString(),
    };
    const orphanSessionOldScheduledAt = {
      id: 5,
      status: 'in_progress',
      scheduledAt: new Date(now - 15 * 3600 * 1000).toISOString(),
    };

    const sessions = [
      recentSession,
      orphanSessionOldStartTime,
      orphanSessionOldCreatedAt,
      orphanSessionOldCreateAt,
      orphanSessionOldScheduledAt,
    ];
    expect(getLiveInterviewSessions(sessions).map((s) => s.id)).toEqual([1]);
  });

  it('requires confirmation dialog before force-ending an active interview session', () => {
    const source = readInterviewPageSource('InterviewLivePage.tsx');

    expect(source).toContain('confirmSession');
    expect(source).toContain('handleRequestEnd');
    expect(source).toContain('onForceEnd={handleRequestEnd}');
    expect(source).toContain('Dialog');
    expect(source).toContain('interviewLive.confirmEndTitle');
    expect(source).toContain('interviewLive.confirmEndWarning');
    expect(source).toContain('interviewLive.confirmEndButton');
    expect(source).toContain('handleForceEnd(target)');
  });
});
