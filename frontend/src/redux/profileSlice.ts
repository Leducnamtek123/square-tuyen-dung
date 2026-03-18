import { createSlice } from '@reduxjs/toolkit';

interface ProfileState {
  resume: {
    isReloadResume: boolean;
  };
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    resume: {
      isReloadResume: false,
    },
  } as ProfileState,
  reducers: {
    reloadResume: (state) => {
      state.resume.isReloadResume = !state.resume.isReloadResume;
    },
  },
});

const { reducer } = profileSlice;
const { reloadResume } = profileSlice.actions;

export default reducer;
export { reloadResume };
