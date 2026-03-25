import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { SystemConfig } from '../types/models';
import commonService from '../services/commonService';

interface ConfigState {
  allConfig: SystemConfig | null;
}

const CONFIG_CACHE_KEY = 'sq_allConfig_cache';
const CONFIG_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getAllConfig = createAsyncThunk<SystemConfig, void>(
  'config/getAllConfig',
  async () => {
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(CONFIG_CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CONFIG_CACHE_TTL) {
          return data as SystemConfig;
        }
      }
    } catch {
      // Cache parse error — ignore and fetch fresh
    }

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

    // Persist to localStorage
    try {
      localStorage.setItem(
        CONFIG_CACHE_KEY,
        JSON.stringify({ data: merged, ts: Date.now() })
      );
    } catch {
      // Storage full — silently ignore
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
