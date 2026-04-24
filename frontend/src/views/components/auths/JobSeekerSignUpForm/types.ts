import type { RoleName } from '../../../../types/auth';
import type { CodeResponse } from '@react-oauth/google';

export interface JobSeekerSignUpFormData {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

type FacebookAuthResult = { data?: { accessToken?: string } };

interface JobSeekerSignUpFormProps {
  onRegister: (data: JobSeekerSignUpFormData) => void;
  onFacebookRegister: (result: FacebookAuthResult) => void;
  onGoogleRegister: (result: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => void;
  serverErrors?: Record<string, string[]>;
  checkCreds?: (email: string, roleName: RoleName) => Promise<boolean>;
}
