import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoleName } from '../types/auth';

interface VerifyState {
  email: string;
  roleName: RoleName | '';
}

interface AuthState {
  isAllowVerifyEmail: boolean;
  email: string;
  roleName: RoleName | '';
}

interface VerifyEmailPayload {
  isAllowVerifyEmail?: boolean;
  email?: string;
  roleName?: RoleName | '';
}

const loadVerifyState = (): VerifyState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('verifyEmail');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VerifyState>;
    if (!parsed?.email) return null;
    return {
      email: parsed.email,
      roleName: parsed.roleName || '',
    };
  } catch {
    return null;
  }
};

const persistVerifyState = (state: AuthState): void => {
  if (typeof window === 'undefined') return;
  if (state?.isAllowVerifyEmail && state?.email) {
    sessionStorage.setItem(
      'verifyEmail',
      JSON.stringify({ email: state.email, roleName: state.roleName || '' })
    );
  } else {
    sessionStorage.removeItem('verifyEmail');
  }
};

const storedVerify = loadVerifyState();

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAllowVerifyEmail: !!storedVerify?.email,
    email: storedVerify?.email || '',
    roleName: storedVerify?.roleName || '',
  } as AuthState,
  reducers: {
    updateVerifyEmail: (state, action: PayloadAction<VerifyEmailPayload>) => {
      state.isAllowVerifyEmail = action.payload?.isAllowVerifyEmail as boolean;
      state.email = action.payload?.email as string;
      state.roleName = action.payload?.roleName as RoleName | '';
      persistVerifyState(state);
    },
  },
});

const { actions, reducer } = authSlice;
const { updateVerifyEmail } = actions;

export default reducer;
export { updateVerifyEmail };
