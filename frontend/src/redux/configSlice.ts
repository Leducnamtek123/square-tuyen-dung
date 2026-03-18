import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { SystemConfig } from '../types/models';
import commonService from '../services/commonService';

interface ConfigState {
  allConfig: SystemConfig | null;
}

const getAllConfig = createAsyncThunk<SystemConfig, void>(
  'config/getAllConfig',
  async () => {
    const resData = await commonService.getConfigs();
    return resData as SystemConfig;
  }
);

export const configSlice = createSlice({
  name: 'config',
  initialState: { allConfig: null } as ConfigState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllConfig.fulfilled, (state, action) => {
      state.allConfig = action.payload;
    });
  },
});

const { reducer } = configSlice;

export default reducer;
export { getAllConfig };
