import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { SystemConfig } from '../types/models';
import commonService from '../services/commonService';

interface ConfigState {
  allConfig: any;
}

const getAllConfig = createAsyncThunk<SystemConfig, void>(
  'config/getAllConfig',
  async () => {
    // Fire both requests in parallel instead of sequentially
    const [resData, careersRes] = await Promise.all([
      commonService.getConfigs(),
      commonService.getAllCareersSimple().catch(() => [] as any[]),
    ]);

    let merged = { ...(resData as SystemConfig) };

    if (Array.isArray(careersRes) && careersRes.length > 0) {
      merged = {
        ...merged,
        careers: careersRes,
        careerOptions: careersRes.map((career: any) => ({
          id: career.id,
          name: career.name,
        })),
      };
    }

    return merged as SystemConfig;
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
