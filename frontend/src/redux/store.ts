import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import authReducer from './authSlice';
import filterReducer from './filterSlice';
import profileReducer from './profileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    filter: filterReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
