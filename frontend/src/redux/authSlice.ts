import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoleName } from '../types/auth';

interface AuthState {
  isAllowVerifyEmail: boolean;
  email: string;
  roleName: RoleName | '';
}

interface VerifyEmailPayload {
  isAllowVerifyEmail: boolean;
  email: string;
  roleName?: RoleName | '';
}

const VERIFY_STORAGE_KEY = 'verifyEmail';

const loadVerifyState = (): Partial<AuthState> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(VERIFY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (!parsed?.email) return null;
    return {
      email: parsed.email,
      roleName: parsed.roleName || '',
    };
  } catch {
    return null;
  }
};

const storedVerify = loadVerifyState();

const initialState: AuthState = {
  isAllowVerifyEmail: !!storedVerify?.email,
  email: storedVerify?.email || '',
  roleName: storedVerify?.roleName || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateVerifyEmail: (state, action: PayloadAction<VerifyEmailPayload>) => {
      const { isAllowVerifyEmail, email, roleName = '' } = action.payload;
      state.isAllowVerifyEmail = isAllowVerifyEmail;
      state.email = email;
      state.roleName = roleName;
    },
  },
});

const { actions, reducer } = authSlice;
const { updateVerifyEmail } = actions;

export default reducer;
export { updateVerifyEmail };
