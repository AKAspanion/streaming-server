import { createSlice } from '@reduxjs/toolkit';
import { generateToken } from './actions/authActions';

export type AuthState = {
  loading: boolean;
  user: object;
  token?: string | null;
  success: boolean;
};

const initialState: AuthState = {
  loading: false,
  user: {},
  token: null,
  success: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(generateToken.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateToken.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true; // registration successful
      if (payload?.data?.token) {
        state.token = payload?.data?.token;
        window.token = payload?.data?.token;
      }
    });
    builder.addCase(generateToken.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default authSlice.reducer;
