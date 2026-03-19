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
    let merged = { ...(resData as SystemConfig) };

    try {
      const careers = await commonService.getAllCareers({ pageSize: 1000 });
      if (Array.isArray(careers) && careers.length > 0) {
        merged = {
          ...merged,
          careers,
          careerOptions: careers.map((career: any) => ({
            id: career.id,
            name: career.name,
          })),
        };
      }
    } catch {
      // Fall back to config-provided careers if the full list endpoint fails.
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
