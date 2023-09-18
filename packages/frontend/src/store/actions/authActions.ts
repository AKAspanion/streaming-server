import { getNetworkAPIUrl } from '@/config/api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const generateToken = createAsyncThunk('auth/token', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${getNetworkAPIUrl()}/auth/token/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // return custom error message from backend if present
    if (error.response && error.response.data.message) {
      return rejectWithValue(error.response.data.message);
    } else {
      return rejectWithValue(error.message);
    }
  }
});
