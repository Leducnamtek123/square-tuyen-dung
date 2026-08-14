import { buildEmployeeFromApplicationPayload, EmployeeFromApplicationFormState } from '../employeeFromApplicationDialogState';

const baseForm: EmployeeFromApplicationFormState = {
  departmentId: 5,
  designationId: 10,
  reportsToId: 2,
  joinDate: '2026-06-05',
  probationEndDate: '2026-08-05',
  baseSalary: 15000000,
  allowance: 2000000,
  employmentType: 'FULL_TIME',
  status: 'PROBATION',
  notes: 'Onboarded from application',
};

describe('buildEmployeeFromApplicationPayload', () => {
  it('builds a complete OnboardCandidatePayload from valid form state', () => {
    expect(buildEmployeeFromApplicationPayload(12, baseForm)).toEqual({
      job_application_id: 12,
      department_id: 5,
      designation_id: 10,
      reports_to_id: 2,
      join_date: '2026-06-05',
      probation_end_date: '2026-08-05',
      base_salary: 15000000,
      allowance: 2000000,
      employment_type: 'FULL_TIME',
      status: 'PROBATION',
      notes: 'Onboarded from application',
    });
  });

  it('handles empty optional fields cleanly without NaN or invalid types', () => {
    const emptyForm: EmployeeFromApplicationFormState = {
      departmentId: '',
      designationId: '',
      reportsToId: null,
      joinDate: '',
      probationEndDate: '',
      baseSalary: '',
      allowance: '',
      employmentType: '',
      status: '',
      notes: '   ',
    };

    expect(buildEmployeeFromApplicationPayload(99, emptyForm)).toEqual({
      job_application_id: 99,
      department_id: undefined,
      designation_id: undefined,
      reports_to_id: undefined,
      join_date: undefined,
      probation_end_date: undefined,
      base_salary: 0,
      allowance: 0,
      employment_type: 'FULL_TIME',
      status: 'PROBATION',
      notes: undefined,
    });
  });
});

