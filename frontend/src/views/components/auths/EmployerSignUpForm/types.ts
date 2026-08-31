import type { RoleName, EmployerSignUpFormData } from '@/types/auth';

export type { EmployerSignUpFormData };

interface EmployerSignUpFormProps {
  onSignUp: (data: EmployerSignUpFormData) => void;
  serverErrors?: Record<string, string[] | NestedServerErrors>;
  checkCreds: (email: string, roleName: RoleName) => Promise<boolean>;
}

type NestedServerErrors = Record<string, string[] | Record<string, string[]>>;
