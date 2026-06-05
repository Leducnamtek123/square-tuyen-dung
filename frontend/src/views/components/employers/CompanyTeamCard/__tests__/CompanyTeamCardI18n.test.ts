import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyTeamCard i18n', () => {
  it('does not hard-code fallback text for fixed team copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'common:actions.cancel',
      'common:actions.delete',
      'common:actions.edit',
      'common:actions.save',
      'common:actions.title',
      'common:loading',
      'common:messages.saveSuccess',
      'employer:company.team.addMember',
      'employer:company.team.addRole',
      'employer:company.team.createMember',
      'employer:company.team.createRole',
      'employer:company.team.deleteMemberTitle',
      'employer:company.team.deleteMemberConfirm',
      'employer:company.team.deleteRoleTitle',
      'employer:company.team.deleteRoleConfirm',
      'employer:company.team.editMember',
      'employer:company.team.editRole',
      'employer:company.team.member',
      'employer:company.team.membersTitle',
      'employer:company.team.membersSubtitle',
      'employer:company.team.noMembers',
      'employer:company.team.noRoles',
      'employer:company.team.permissionLabels.all',
      'employer:company.team.permissionLabels.manageCandidates',
      'employer:company.team.permissionLabels.manageCompanyProfile',
      'employer:company.team.permissionLabels.manageInterviews',
      'employer:company.team.permissionLabels.manageJobPosts',
      'employer:company.team.permissionLabels.manageEmployees',
      'employer:company.team.permissionLabels.manageMembers',
      'employer:company.team.permissionLabels.manageQuestionBank',
      'employer:company.team.permissionLabels.manageRoles',
      'employer:company.team.permissions',
      'employer:company.team.permissionsHint',
      'employer:company.team.roleCode',
      'employer:company.team.roleDescription',
      'employer:company.team.roleName',
      'employer:company.team.rolesTitle',
      'employer:company.team.rolesSubtitle',
      'employer:company.team.status',
      'employer:company.team.statusActive',
      'employer:company.team.statusDisabled',
      'employer:company.team.statusInvited',
      'employer:company.team.systemRoleLocked',
      'employer:company.team.userId',
    ];

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toContain('defaultValue');
        expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }

    expect(source).not.toContain("t('employer:company.team.description'");
  });
});
