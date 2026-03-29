import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedWorkspace, User, Workspace } from '../types/models';
import authService from '../services/authService';
import tokenService from '../services/tokenService';

interface UserState {
  isAuthenticated: boolean;
  currentUser: User | null;
  activeWorkspace: NormalizedWorkspace | null;
}

interface RemoveUserInfoPayload {
  accessToken: string;
  backend?: string;
}

const getUserWorkspaces = createAsyncThunk<Partial<User>, void>(
  'user/getUserWorkspaces',
  async () => {
    const resData = await authService.getUserWorkspaces();
    return resData as Partial<User>;
  }
);

const getUserInfo = createAsyncThunk<User, void>(
  'user/getUserInfo',
  async (_, thunkAPI) => {
    const resData = await authService.getUserInfo();
    thunkAPI.dispatch(getUserWorkspaces());
    return resData as User;
  }
);

const updateUserInfo = createAsyncThunk<User, Record<string, unknown>>(
  'user/updateUser',
  async (data) => {
    const resData = await authService.updateUser(data);
    return resData as User;
  }
);

const removeUserInfo = createAsyncThunk<void, RemoveUserInfoPayload>(
  'user/removeUserInfo',
  async () => {
    const removeResult = tokenService.removeAccessTokenAndRefreshTokenFromCookie();
    if (!removeResult) {
      return Promise.reject("Can't remove token in Cookie");
    }
  }
);

const updateAvatar = createAsyncThunk<User, FormData>(
  'user/updateAvatar',
  async (formData) => {
    const resData = await authService.updateAvatar(formData);
    return resData as User;
  }
);

const deleteAvatar = createAsyncThunk<User, void>(
  'user/deleteAvatar',
  async () => {
    const resData = await authService.deleteAvatar();
    return resData as User;
  }
);

const ACTIVE_WORKSPACE_STORAGE_KEY = 'active_workspace';

type AnyWorkspace = Workspace | NormalizedWorkspace | null | undefined;

const loadActiveWorkspace = (): NormalizedWorkspace | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NormalizedWorkspace) : null;
  } catch {
    return null;
  }
};

const normalizeWorkspace = (workspace: AnyWorkspace): NormalizedWorkspace | null => {
  if (!workspace) return null;
  return {
    type: workspace.type,
    companyId: workspace.companyId || null,
    label: workspace.label || '',
  };
};

const resolveActiveWorkspace = (
  workspaces: Workspace[] | null | undefined,
  preferred: NormalizedWorkspace | null,
  currentUser: User | null | undefined
): NormalizedWorkspace | null => {
  const workspaceList = Array.isArray(workspaces) ? workspaces : [];
  if (!workspaceList.length) return null;

  if (preferred?.type) {
    const match = workspaceList.find((workspace) => {
      if (workspace.type !== preferred.type) return false;
      if (workspace.type === 'company') {
        return Number(workspace.companyId) === Number(preferred.companyId);
      }
      return true;
    });
    if (match) return normalizeWorkspace(match);
  }

  const defaultWorkspace = workspaceList.find((workspace) => workspace.isDefault);
  if (defaultWorkspace) return normalizeWorkspace(defaultWorkspace);

  if (currentUser?.roleName === 'EMPLOYER') {
    const firstCompany = workspaceList.find((workspace) => workspace.type === 'company');
    if (firstCompany) return normalizeWorkspace(firstCompany);
    return null;
  }

  const firstJobSeeker = workspaceList.find((workspace) => workspace.type === 'job_seeker');
  if (firstJobSeeker) return normalizeWorkspace(firstJobSeeker);

  return normalizeWorkspace(workspaceList[0]);
};

const storedWorkspace = loadActiveWorkspace();

const initialState: UserState = {
  isAuthenticated: false,
  currentUser: null,
  activeWorkspace: storedWorkspace,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<AnyWorkspace>) => {
      state.activeWorkspace = normalizeWorkspace(action.payload);
      // Persistence is handled by listenerMiddleware in store.ts
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserInfo.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      if (Array.isArray(action.payload?.workspaces) && action.payload.workspaces.length) {
        state.activeWorkspace = resolveActiveWorkspace(
          action.payload.workspaces,
          state.activeWorkspace || storedWorkspace,
          action.payload
        );
      }
    });

    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.activeWorkspace = resolveActiveWorkspace(
        action.payload?.workspaces,
        state.activeWorkspace || storedWorkspace,
        action.payload
      );
    });

    builder.addCase(getUserWorkspaces.fulfilled, (state, action) => {
      const nextUser: User = {
        ...(state.currentUser as User),
        ...(action.payload || {}),
      } as User;
      state.currentUser = nextUser;
      state.activeWorkspace = resolveActiveWorkspace(
        action.payload?.workspaces,
        state.activeWorkspace || storedWorkspace,
        nextUser
      );
    });

    builder.addCase(removeUserInfo.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.activeWorkspace = null;
    });

    builder.addCase(updateAvatar.fulfilled, (state, action) => {
      if (state.currentUser) {
        state.currentUser.avatarUrl = action.payload?.avatarUrl || null;
      }
    });

    builder.addCase(deleteAvatar.fulfilled, (state, action) => {
      if (state.currentUser) {
        state.currentUser.avatarUrl = action.payload?.avatarUrl || null;
      }
    });
  },
});

const { reducer } = userSlice;
const { setActiveWorkspace } = userSlice.actions;

export default reducer;
export {
  getUserInfo,
  getUserWorkspaces,
  updateUserInfo,
  removeUserInfo,
  updateAvatar,
  deleteAvatar,
  setActiveWorkspace,
};
