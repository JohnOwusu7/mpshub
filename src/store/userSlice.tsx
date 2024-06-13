import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { loginApi } from '../Api/api';

// Define saveTokenToLocalStorage function
const saveTokenToLocalStorage = (token: string) => {
  localStorage.setItem('token', token);
};

// Define saveUserToLocalStorage function
const saveUserToLocalStorage = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const loadUserFromLocalStorage = () => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

const initialState = {
  loading: false,
  user: loadUserFromLocalStorage(), // Initialize user from localStorage
  error: null as string | null, // Initialize error
};

interface UserState {
  loading: boolean;
  user: null;
  error: string | null;
}

interface LoginCredentials {
  identityNo: string;
  password: string;
}

export const login = createAsyncThunk(
  'user/login',
  async ({ identityNo, password }: LoginCredentials, { rejectWithValue, getState }) => {
    try {
      const response = await loginApi(identityNo, password);

      console.log('Login Response:', response); // Debug statement

      if (response.success === true) {
        saveTokenToLocalStorage(response.token);
        saveUserToLocalStorage(response.user); // Save user data to local storage

        console.log('User data:', response.user); // Debug statement
        console.log('Saved user data:', localStorage.getItem('user'));
      }

      return response;
    } catch (error: any) {
      console.error('Login Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Use createAction to define the logout action
export const logout = createAction('user/logout');

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.user = null;
      });
  },
});

export default userSlice.reducer;