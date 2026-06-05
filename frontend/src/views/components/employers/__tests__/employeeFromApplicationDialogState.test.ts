import { buildEmployeeFromApplicationPayload } from '../employeeFromApplicationDialogState';
import { readFileSync } from 'fs';
import { join } from 'path';

const baseForm = {
  fullName: 'Manual Candidate',
  email: '',
  phone: '',
  jobTitle: 'Frontend Developer',
  department: '',
  startDate: '2026-06-05',
  createHrmAccount: true,
  sendWelcomeEmail: true,
  hrmRoles: 'Employee, System Manager',
  notes: '',
};

describe('buildEmployeeFromApplicationPayload', () => {
  it('does not request HRM account creation when email is missing', () => {
    expect(buildEmployeeFromApplicationPayload(12, baseForm)).toEqual({
      applicationId: 12,
      fullName: 'Manual Candidate',
      email: undefined,
      phone: undefined,
      jobTitle: 'Frontend Developer',
      department: undefined,
      startDate: '2026-06-05',
      createHrmAccount: false,
      sendWelcomeEmail: false,
      hrmRoles: [],
      notes: undefined,
    });
  });

  it('does not send free-text HRM roles when email is present', () => {
    expect(buildEmployeeFromApplicationPayload(12, {
      ...baseForm,
      email: ' candidate@example.com ',
      hrmRoles: 'Employee, Employee',
    })).toEqual(expect.objectContaining({
      email: 'candidate@example.com',
      createHrmAccount: true,
      sendWelcomeEmail: true,
      hrmRoles: [],
    }));
  });

  it('drops unsupported free-text HRM roles so backend configured defaults are used', () => {
    expect(buildEmployeeFromApplicationPayload(12, {
      ...baseForm,
      email: 'candidate@example.com',
      hrmRoles: 'Employee, System Manager',
    }).hrmRoles).toEqual([]);
  });

  it('does not hard-code fallback text for HRM account options', () => {
    const source = readFileSync(join(__dirname, '../EmployeeFromApplicationDialog.tsx'), 'utf8');
    const optionKeys = [
      'employer:employees.hrm.convert.createHrmAccount',
      'employer:employees.hrm.convert.sendWelcomeEmail',
    ];

    for (const key of optionKeys) {
      const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
    }
  });
});
