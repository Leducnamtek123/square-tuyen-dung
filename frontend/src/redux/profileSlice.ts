import { createSlice } from '@reduxjs/toolkit';

interface ProfileState {
  resume: {
    /** Incremented to signal that resume data should be refetched. */
    reloadCounter: number;
  };
}

const initialState: ProfileState = {
  resume: {
    reloadCounter: 0,
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /**
     * Increment a counter instead of toggling a boolean.
     * Components should use this value as a React Query / useEffect dependency
     * to trigger a refetch when it changes.
     */
    reloadResume: (state) => {
      state.resume.reloadCounter += 1;
    },
  },
});

const { reducer } = profileSlice;
const { reloadResume } = profileSlice.actions;

export default reducer;
export { reloadResume };
