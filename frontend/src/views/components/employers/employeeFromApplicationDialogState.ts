import type { EmployeeFromApplicationPayload } from '@/services/hrmService';

export type EmployeeFromApplicationFormState = {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  startDate: string;
  createHrmAccount: boolean;
  sendWelcomeEmail: boolean;
  hrmRoles: string;
  notes: string;
};

export const hasEmployeeAccountEmail = (email: string): boolean => Boolean(email.trim());

export const buildEmployeeFromApplicationPayload = (
  applicationId: number,
  form: EmployeeFromApplicationFormState
): EmployeeFromApplicationPayload => {
  const email = form.email.trim();
  const canCreateHrmAccount = form.createHrmAccount && hasEmployeeAccountEmail(email);

  return {
    applicationId,
    fullName: form.fullName.trim(),
    email: email || undefined,
    phone: form.phone.trim() || undefined,
    jobTitle: form.jobTitle.trim(),
    department: form.department.trim() || undefined,
    startDate: form.startDate || null,
    createHrmAccount: canCreateHrmAccount,
    sendWelcomeEmail: canCreateHrmAccount && form.sendWelcomeEmail,
    hrmRoles: [],
    notes: form.notes.trim() || undefined,
  };
};
