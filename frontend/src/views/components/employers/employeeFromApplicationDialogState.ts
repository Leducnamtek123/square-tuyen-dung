import type { OnboardCandidatePayload } from '@/services/hrmService';

export type EmployeeFromApplicationFormState = {
  departmentId: number | '' | null;
  designationId: number | '' | null;
  reportsToId: number | '' | null;
  joinDate: string;
  probationEndDate: string;
  baseSalary: number | '';
  allowance: number | '';
  employmentType: string;
  status: string;
  notes: string;
};

export const buildEmployeeFromApplicationPayload = (
  applicationId: number,
  form: EmployeeFromApplicationFormState,
): OnboardCandidatePayload => {
  return {
    job_application_id: applicationId,
    department_id: form.departmentId ? Number(form.departmentId) : undefined,
    designation_id: form.designationId ? Number(form.designationId) : undefined,
    reports_to_id: form.reportsToId ? Number(form.reportsToId) : undefined,
    join_date: form.joinDate || undefined,
    probation_end_date: form.probationEndDate || undefined,
    base_salary: form.baseSalary !== '' ? Number(form.baseSalary) : 0,
    allowance: form.allowance !== '' ? Number(form.allowance) : 0,
    employment_type: form.employmentType || 'FULL_TIME',
    status: form.status || 'PROBATION',
    notes: form.notes.trim() || undefined,
  };
};
