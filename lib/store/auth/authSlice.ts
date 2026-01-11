import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "@/types/auth";

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true, // Make sure this is true initially
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      // Clear local storage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
      // Ensure any other auth state is cleared
      // If you have other properties in the auth state, reset them here
    },
    restoreState: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = action.payload.loading;
      state.error = action.payload.error;
    },
  },
});

export const { setCredentials, setLoading, setError, logout, restoreState } =
  authSlice.actions;
export default authSlice.reducer;
