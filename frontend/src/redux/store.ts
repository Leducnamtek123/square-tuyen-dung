import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import userReducer, { setActiveWorkspace } from './userSlice';
import authReducer, { updateVerifyEmail } from './authSlice';
import filterReducer from './filterSlice';
import profileReducer from './profileSlice';

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
          'verifyEmail',
          JSON.stringify({ email, roleName: roleName || '' }),
        );
      } else {
        sessionStorage.removeItem('verifyEmail');
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
        localStorage.setItem('active_workspace', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('active_workspace');
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
