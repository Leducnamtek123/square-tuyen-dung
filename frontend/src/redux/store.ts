import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import userReducer, { setActiveWorkspace } from './userSlice';
import authReducer, { updateVerifyEmail } from './authSlice';
import filterReducer from './filterSlice';
import profileReducer from './profileSlice';
import {
  ACTIVE_WORKSPACE_STORAGE_KEY,
  LEGACY_ACTIVE_WORKSPACE_STORAGE_KEY,
  LEGACY_VERIFY_EMAIL_STORAGE_KEY,
  VERIFY_EMAIL_STORAGE_KEY,
} from '@/utils/storageKeys';

// ---------------------------------------------------------------------------
// Persistence middleware — keeps side effects OUT of reducers
// ---------------------------------------------------------------------------

const persistenceMiddleware = createListenerMiddleware();

// Persist auth verify state to sessionStorage
persistenceMiddleware.startListening({
  actionCreator: updateVerifyEmail,
  effect: (action) => {
    if (typeof window === 'undefined') return;
    try {
      const { isAllowVerifyEmail, email, roleName } = action.payload;
      if (isAllowVerifyEmail && email) {
        sessionStorage.setItem(
          VERIFY_EMAIL_STORAGE_KEY,
          JSON.stringify({ email, roleName: roleName || '' }),
        );
        sessionStorage.removeItem(LEGACY_VERIFY_EMAIL_STORAGE_KEY);
      } else {
        sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY);
        sessionStorage.removeItem(LEGACY_VERIFY_EMAIL_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  },
});

// Persist active workspace to localStorage
persistenceMiddleware.startListening({
  actionCreator: setActiveWorkspace,
  effect: (action) => {
    if (typeof window === 'undefined') return;
    try {
      if (action.payload) {
        localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, JSON.stringify(action.payload));
        localStorage.removeItem(LEGACY_ACTIVE_WORKSPACE_STORAGE_KEY);
      } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
        localStorage.removeItem(LEGACY_ACTIVE_WORKSPACE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  },
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    filter: filterReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
