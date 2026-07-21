// Jest globals: describe, it, expect, beforeEach
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  getUserInfo,
  getUserWorkspaces,
  updateUserInfo,
  updateAvatar,
  deleteAvatar,
  removeUserInfo,
  setActiveWorkspace,
} from '../userSlice';
import authReducer, { updateVerifyEmail } from '../authSlice';
import filterReducer, {
  searchJobPost,
  searchJobPostWithKeyword,
  resetSearchJobPostFilter,
  searchCompany,
  resetSearchCompany,
  searchResume,
  resetSearchResume,
} from '../filterSlice';
import profileReducer, { reloadResume } from '../profileSlice';
import type { RootState } from '../store';
import type { User } from '../types/models';

// ─── userSlice tests ────────────────────────────────────────────
describe('userSlice', () => {
  it('should have correct initial state', () => {
    const state = userReducer(undefined, { type: '@@INIT' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
  });

  it('should set activeWorkspace', () => {
    const workspace = { type: 'job_seeker' as const, companyId: null, label: 'Job Seeker' };
    const state = userReducer(undefined, setActiveWorkspace(workspace));
    expect(state.activeWorkspace).toEqual({
      type: 'job_seeker',
      companyId: null,
      label: 'Job Seeker',
    });
  });

  it('should clear activeWorkspace with null', () => {
    const initialState = {
      isAuthenticated: true,
      currentUser: null,
      activeWorkspace: { type: 'job_seeker' as const, companyId: null, label: 'Test' },
    };
    const state = userReducer(initialState, setActiveWorkspace(null));
    expect(state.activeWorkspace).toBeNull();
  });

  it('should reset state on removeUserInfo.fulfilled', () => {
    const loggedInState = {
      isAuthenticated: true,
      currentUser: { id: 1, fullName: 'Test User' } as User,
      activeWorkspace: { type: 'job_seeker' as const, companyId: null, label: '' },
    };
    const action = { type: removeUserInfo.fulfilled.type };
    const state = userReducer(loggedInState, action);
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
    expect(state.activeWorkspace).toBeNull();
  });

  it('should handle getUserInfo.fulfilled', () => {
    const action = {
      type: getUserInfo.fulfilled.type,
      payload: { id: 1, email: 'test@example.com', workspaces: [{ type: 'company', companyId: 10, label: 'Company 1' }] }
    };
    const state = userReducer(undefined, action);
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.email).toBe('test@example.com');
    // tests resolveActiveWorkspace falling back to first item when no preferred default exists and role is not EMPLOYER
    expect(state.activeWorkspace).toEqual({ type: 'company', companyId: 10, label: 'Company 1' });
  });

  it('should resolve active workspace based on preferred workspace during getUserInfo', () => {
    const initialState = {
      isAuthenticated: false,
      currentUser: null,
      activeWorkspace: { type: 'job_seeker' as const, companyId: null, label: 'Preferred JS' },
    };
    const action = {
      type: getUserInfo.fulfilled.type,
      payload: {
        id: 1, email: 'test@example.com',
        workspaces: [
          { type: 'company', companyId: 10, label: 'Company 1' },
          { type: 'job_seeker', companyId: null, label: 'My JS Workspace' }
        ]
      }
    };
    const state = userReducer(initialState, action);
    expect(state.activeWorkspace).toEqual({ type: 'job_seeker', companyId: null, label: 'My JS Workspace' });
  });

  it('should resolve default workspace if preferred is not found', () => {
    const action = {
      type: getUserWorkspaces.fulfilled.type,
      payload: {
        workspaces: [
          { type: 'company', companyId: 10, label: 'No Default' },
          { type: 'company', companyId: 11, label: 'Default', isDefault: true }
        ]
      }
    };
    const state = userReducer(undefined, action);
    expect(state.activeWorkspace).toEqual({ type: 'company', companyId: 11, label: 'Default' });
  });

  it('should resolve first company if employer and no preferred/default', () => {
    const action = {
      type: getUserWorkspaces.fulfilled.type,
      payload: {
        roleName: 'EMPLOYER',
        workspaces: [
          { type: 'job_seeker', companyId: null, label: 'JS' },
          { type: 'company', companyId: 15, label: 'First Company' }
        ]
      }
    };
    const state = userReducer(undefined, action);
    expect(state.activeWorkspace).toEqual({ type: 'company', companyId: 15, label: 'First Company' });
  });
});

// ─── authSlice tests ────────────────────────────────────────────
describe('authSlice', () => {
  it('should have correct initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toHaveProperty('isAllowVerifyEmail');
    expect(state).toHaveProperty('email');
    expect(state).toHaveProperty('roleName');
  });

  it('should update verify email state', () => {
    const state = authReducer(undefined, updateVerifyEmail({
      isAllowVerifyEmail: true,
      email: 'test@example.com',
      roleName: 'JOB_SEEKER',
    }));
    expect(state.isAllowVerifyEmail).toBe(true);
    expect(state.email).toBe('test@example.com');
    expect(state.roleName).toBe('JOB_SEEKER');
  });

  it('should clear verify email state', () => {
    const loggedInState = {
      isAllowVerifyEmail: true,
      email: 'test@example.com',
      roleName: 'JOB_SEEKER' as const,
    };
    const state = authReducer(loggedInState, updateVerifyEmail({
      isAllowVerifyEmail: false,
      email: '',
      roleName: '',
    }));
    expect(state.isAllowVerifyEmail).toBe(false);
    expect(state.email).toBe('');
  });
});

// ─── filterSlice tests ──────────────────────────────────────────
describe('filterSlice', () => {
  const initialJobPostFilter = {
    kw: '', careerId: '', cityId: '', districtId: '', wardId: '',
    positionId: '', experienceId: '', typeOfWorkplaceId: '',
    jobTypeId: '', genderId: '', page: 1, pageSize: 30,
  };

  it('should have correct initial state', () => {
    const state = filterReducer(undefined, { type: '@@INIT' });
    expect(state.jobPostFilter).toEqual(initialJobPostFilter);
    expect(state.companyFilter.page).toBe(1);
    expect(state.resumeFilter.page).toBe(1);
  });

  it('should search job posts with keyword', () => {
    const state = filterReducer(undefined, searchJobPostWithKeyword({ kw: 'react developer' }));
    expect(state.jobPostFilter.kw).toBe('react developer');
    expect(state.jobPostFilter.page).toBe(1);
  });

  it('should update full job post filter', () => {
    const filter = { ...initialJobPostFilter, kw: 'test', careerId: '5', page: 2 };
    const state = filterReducer(undefined, searchJobPost(filter));
    expect(state.jobPostFilter.kw).toBe('test');
    expect(state.jobPostFilter.careerId).toBe('5');
    expect(state.jobPostFilter.page).toBe(2);
  });

  it('should reset job post filter', () => {
    const modifiedState = filterReducer(undefined, searchJobPostWithKeyword({ kw: 'test' }));
    expect(modifiedState.jobPostFilter.kw).toBe('test');
    
    const resetState = filterReducer(modifiedState, resetSearchJobPostFilter());
    expect(resetState.jobPostFilter).toEqual(initialJobPostFilter);
  });

  it('should update company filter', () => {
    const filter = { kw: 'square', cityId: '1', page: 1, pageSize: 12 };
    const state = filterReducer(undefined, searchCompany(filter));
    expect(state.companyFilter.kw).toBe('square');
    expect(state.companyFilter.cityId).toBe('1');
  });

  it('should reset company filter', () => {
    const modified = filterReducer(undefined, searchCompany({ kw: 'test', cityId: '1', page: 2, pageSize: 12 }));
    const reset = filterReducer(modified, resetSearchCompany());
    expect(reset.companyFilter.kw).toBe('');
    expect(reset.companyFilter.page).toBe(1);
  });

  it('should update resume filter', () => {
    const filter = {
      kw: 'dev', cityId: '1', careerId: '2', experienceId: '3',
      positionId: '4', academicLevelId: '5', typeOfWorkplaceId: '6',
      jobTypeId: '7', genderId: '8', maritalStatusId: '9',
      page: 3, pageSize: 10,
    };
    const state = filterReducer(undefined, searchResume(filter));
    expect(state.resumeFilter.kw).toBe('dev');
    expect(state.resumeFilter.page).toBe(3);
  });

  it('should reset resume filter', () => {
    const reset = filterReducer(undefined, resetSearchResume());
    expect(reset.resumeFilter.kw).toBe('');
    expect(reset.resumeFilter.page).toBe(1);
  });
});

// ─── profileSlice tests ─────────────────────────────────────────
describe('profileSlice', () => {
  it('should have correct initial state', () => {
    const state = profileReducer(undefined, { type: '@@INIT' });
    expect(state.resume.reloadCounter).toBe(0);
  });

  it('should increment reloadCounter', () => {
    const state1 = profileReducer(undefined, reloadResume());
    expect(state1.resume.reloadCounter).toBe(1);
    
    const state2 = profileReducer(state1, reloadResume());
    expect(state2.resume.reloadCounter).toBe(2);
  });
});

// ─── Store integration test ─────────────────────────────────────
describe('Redux store integration', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        user: userReducer,
        filter: filterReducer,
        profile: profileReducer,
      },
    });
  });

  it('should have all slices in state', () => {
    const state = store.getState() as RootState;
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('filter');
    expect(state).toHaveProperty('profile');
  });

  it('should handle multiple dispatches correctly', () => {
    store.dispatch(searchJobPostWithKeyword({ kw: 'python' }));
    store.dispatch(updateVerifyEmail({ isAllowVerifyEmail: true, email: 'a@b.com', roleName: '' }));
    store.dispatch(reloadResume());

    const state = store.getState() as RootState;
    expect(state.filter.jobPostFilter.kw).toBe('python');
    expect(state.auth.email).toBe('a@b.com');
    expect(state.profile.resume.reloadCounter).toBe(1);
  });
});
