import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import authService from '../services/authService';

import tokenService from '../services/tokenService';

const getUserInfo = createAsyncThunk(

  'user/getUserInfo',

  async (_, thunkAPI) => {

    try {

      const resData = await authService.getUserInfo();

      return resData;

    } catch (error) {

      throw error;

    }

  }

);

const updateUserInfo = createAsyncThunk(

  'user/updateUser',

  async (data, thunkAPI) => {

    try {

      const resData = await authService.updateUser(data);

      return resData;

    } catch (error) {

      throw error;

    }

  }

);

const removeUserInfo = createAsyncThunk(

  'user/removeUserInfo',

  async (data, thunkAPI) => {

    try {

      /**

       * Khong revoktoken

       * RevokToken -> token app -> chet theo

       */

      await authService.revokToken(data.accessToken, data.backend);

      const removeResult =

        tokenService.removeAccessTokenAndRefreshTokenFromCookie();

      if (!removeResult) {

        return Promise.reject("Can't remove token in Cookie");

      }

    } catch (error) {

      throw error;

    }

  }

);

const updateAvatar = createAsyncThunk(

  'user/updateAvatar',

  async (formData, thunkAPI) => {

    try {

      const resData = await authService.updateAvatar(formData);

      return resData;

    } catch (error) {

      throw error;

    }

  }

);

const deleteAvatar = createAsyncThunk(

  'user/deleteAvatar',

  async (_, thunkAPI) => {

    try {

      const resData = await authService.deleteAvatar();

      return resData;

    } catch (error) {

      throw error;

    }

  }

);

const ACTIVE_WORKSPACE_STORAGE_KEY = "active_workspace";

const loadActiveWorkspace = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistActiveWorkspace = (workspace) => {
  if (typeof window === "undefined") return;
  try {
    if (workspace) {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    } else {
      localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

const normalizeWorkspace = (workspace) => {
  if (!workspace) return null;
  return {
    type: workspace.type,
    companyId: workspace.companyId || null,
    label: workspace.label || "",
  };
};

const resolveActiveWorkspace = (workspaces, preferred, currentUser) => {
  const workspaceList = Array.isArray(workspaces) ? workspaces : [];
  if (!workspaceList.length) return null;

  if (preferred?.type) {
    const match = workspaceList.find((w) => {
      if (w.type !== preferred.type) return false;
      if (w.type === "company") return Number(w.companyId) === Number(preferred.companyId);
      return true;
    });
    if (match) return normalizeWorkspace(match);
  }

  const defaultWorkspace = workspaceList.find((w) => w.isDefault);
  if (defaultWorkspace) return normalizeWorkspace(defaultWorkspace);

  if ((currentUser?.roleName || currentUser?.role_name) === "EMPLOYER") {
    const firstCompany = workspaceList.find((w) => w.type === "company");
    if (firstCompany) return normalizeWorkspace(firstCompany);
  }

  const firstJobSeeker = workspaceList.find((w) => w.type === "job_seeker");
  if (firstJobSeeker) return normalizeWorkspace(firstJobSeeker);

  return normalizeWorkspace(workspaceList[0]);
};

const storedWorkspace = loadActiveWorkspace();

export const userSlice = createSlice({

  name: 'user',

  initialState: {

    isAuthenticated: false,

    currentUser: null,

    activeWorkspace: storedWorkspace,

  },

  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = normalizeWorkspace(action.payload);
      persistActiveWorkspace(state.activeWorkspace);
    },
  },

  extraReducers: (builder) => {

    builder.addCase(getUserInfo.fulfilled, (state, action) => {

      state.isAuthenticated = true;

      state.currentUser = action.payload;

      state.activeWorkspace = resolveActiveWorkspace(
        action.payload?.workspaces,
        state.activeWorkspace || storedWorkspace,
        action.payload
      );
      persistActiveWorkspace(state.activeWorkspace);

    });

    builder.addCase(updateUserInfo.fulfilled, (state, action) => {

      state.isAuthenticated = true;

      state.currentUser = action.payload;

      state.activeWorkspace = resolveActiveWorkspace(
        action.payload?.workspaces,
        state.activeWorkspace || storedWorkspace,
        action.payload
      );
      persistActiveWorkspace(state.activeWorkspace);

    });

    builder.addCase(removeUserInfo.fulfilled, (state) => {

      state.isAuthenticated = false;

      state.currentUser = null;

      state.activeWorkspace = null;
      persistActiveWorkspace(null);

    });

    builder.addCase(updateAvatar.fulfilled, (state, action) => {

      return {

        ...state,

        currentUser: {

          ...state.currentUser,

          avatarUrl: action.payload?.avatarUrl || null,

        },

      };

    });

    builder.addCase(deleteAvatar.fulfilled, (state, action) => {

      state.currentUser = {

        ...state.currentUser,

        avatarUrl: action.payload?.avatarUrl || null,

      };

    });

  },

});

const { reducer } = userSlice;

const { setActiveWorkspace } = userSlice.actions;

export default reducer;

export {

  getUserInfo,

  updateUserInfo,

  removeUserInfo,

  updateAvatar,

  deleteAvatar,

  setActiveWorkspace,

};
