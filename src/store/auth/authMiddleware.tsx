import { Dispatch } from 'redux';
import axios from 'axios';
import { loginSuccess } from './authActions';

export const login = (credentials: { username: string; password: string }) => async (dispatch: Dispatch) => {
  try {
    // Make request to server to authenticate user
    const response = await axios.post('/login', credentials);
    const { token } = response.data;

    // Dispatch login success action
    dispatch(loginSuccess(token));

    // Store token in local storage
    localStorage.setItem('token', token);
  } catch (error) {
    // Handle authentication error
  }
};

export const logout = () => async (dispatch: Dispatch) => {
  try {
    // Clear token from local storage
    localStorage.removeItem('token');

    // Dispatch logout action
    dispatch({ type: 'LOGOUT' });

    // Make request to server to invalidate token if necessary
  } catch (error) {
    // Handle logout error
  }
};
