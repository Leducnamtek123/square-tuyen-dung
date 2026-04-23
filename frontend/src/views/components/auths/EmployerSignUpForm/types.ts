import type { RoleName } from '../../../../types/auth';

export interface EmployerSignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    taxCode: string;
    since?: Date | null;
    fieldOperation: string;
    employeeSize: number;
    websiteUrl: string;
    location: {
      city: string | number;
      district: string | number;
      address: string;
      lat: string;
      lng: string;
    };
  };
}

export interface EmployerSignUpFormProps {
  onSignUp: (data: EmployerSignUpFormData) => void;
  serverErrors?: Record<string, string[] | NestedServerErrors>;
  checkCreds: (email: string, roleName: RoleName) => Promise<boolean>;
}

export type NestedServerErrors = Record<string, string[] | Record<string, string[]>>;
