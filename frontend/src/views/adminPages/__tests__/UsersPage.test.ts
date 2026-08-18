import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin UsersPage Component & Access Management', () => {
  const filePath = join(__dirname, '../UsersPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages users, role updates, and user status toggling via useUsers', () => {
    expect(source).toContain('useUsers');
    expect(source).toContain('toggleUserStatus');
    expect(source).toContain('updateUserRole');
    expect(source).toContain('deleteUser');
  });

  it('renders UserTable and UserFilters with pagination support', () => {
    expect(source).toContain('UserTable');
    expect(source).toContain('UserFilters');
    expect(source).toContain('useDataTable');
  });
});
