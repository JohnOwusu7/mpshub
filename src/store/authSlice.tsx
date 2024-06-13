import { createSlice } from '@reduxjs/toolkit';

const loadUserFromLocalStorage = () => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

const initialState = {
  user: loadUserFromLocalStorage(),
  token: localStorage.getItem('token') ?? null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
