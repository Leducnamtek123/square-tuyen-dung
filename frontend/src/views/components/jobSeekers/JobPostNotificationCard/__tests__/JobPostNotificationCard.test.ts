import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobPostNotificationCard Component & CRUD Lifecycle', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries notifications using useJobPostNotifications and manages mutations', () => {
    expect(source).toContain('useJobPostNotifications');
    expect(source).toContain('useJobPostNotificationMutations');
    expect(source).toContain('addMutation');
    expect(source).toContain('updateMutation');
    expect(source).toContain('deleteMutation');
  });

  it('provides form popup for creating and editing job alerts', () => {
    expect(source).toContain('FormPopup');
    expect(source).toContain('JobPostNotificationForm');
    expect(source).toContain('handleShowAdd');
    expect(source).toContain('handleShowUpdate');
    expect(source).toContain('handleAddOrUpdate');
  });

  it('confirms notification deletion with sweetalert2 modal', () => {
    expect(source).toContain('confirmModal');
    expect(source).toContain('handleDeleteJobPostNotification');
  });
});
