import { createSlice } from '@reduxjs/toolkit';

const loadVerifyState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('verifyEmail');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistVerifyState = (state) => {
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

  },

  reducers: {

    updateVerifyEmail: (state, action) => {

      state.isAllowVerifyEmail = action.payload?.isAllowVerifyEmail;

      state.email = action.payload?.email;

      state.roleName = action.payload?.roleName;

      persistVerifyState(state);

    },

  },

});

const { actions, reducer } = authSlice;

const { updateVerifyEmail } = actions;

export default reducer;

export { updateVerifyEmail };
