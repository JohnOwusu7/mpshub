import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { loginApi } from '../Api/api';

// Define saveTokenToLocalStorage function
const saveTokenToLocalStorage = (token: string) => {
  localStorage.setItem('token', token);
};

// Define saveUserToLocalStorage function
const saveUserToLocalStorage = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
  // Remove the separate companyId storage, as it will be part of the user object
  // if (user && user.companyId) {
  //   localStorage.setItem('companyId', user.companyId);
  // }
};

const loadUserFromLocalStorage = () => {
  const userJson = localStorage.getItem('user');
  // const companyId = localStorage.getItem('companyId'); // No longer needed as companyId is in user object
  if (userJson) {
    const user = JSON.parse(userJson);
    return user; // Return the full user object
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
  // Define a more specific type for user, matching the API response
  user: { 
    _id: string; 
    identityNo: string; 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string; 
    position: string; 
    companyId: string; 
    role: string; // ObjectId
    roleName: string; 
    permissions: string[]; 
    status: string;
    subsectionId?: string;
    sectionId?: string;
    departmentId?: string;
  } | null;
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
        // Also ensure companyId is explicitly saved if it's not part of the user object in local storage for some reason
        if (response.user && response.user.companyId) {
          localStorage.setItem('companyId', response.user.companyId);
        }
        if (response.user?.sectionId) {
          const sid = typeof response.user.sectionId === 'object' && response.user.sectionId !== null && '_id' in response.user.sectionId
            ? (response.user.sectionId as { _id: string })._id
            : String(response.user.sectionId);
          localStorage.setItem('sectionId', sid);
        }
        if (response.user?.subsectionId) {
          const subId = typeof response.user.subsectionId === 'object' && response.user.subsectionId !== null && '_id' in response.user.subsectionId
            ? (response.user.subsectionId as { _id: string })._id
            : String(response.user.subsectionId);
          localStorage.setItem('subsectionId', subId);
        }

        console.log('User data:', response.user); // Debug statement
        console.log('Saved user data:', localStorage.getItem('user'));
      }

      return response;
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // Preserve subscription error details for proper handling
      if (error.response?.data?.code === 'SUBSCRIPTION_EXPIRED' || 
          error.response?.data?.code === 'COMPANY_INACTIVE' ||
          error.response?.data?.code === 'SUBSCRIPTION_NOT_CONFIGURED') {
        return rejectWithValue({
          message: error.response.data.message,
          code: error.response.data.code,
          subscriptionEndDate: error.response.data.subscriptionEndDate,
          daysExpired: error.response.data.daysExpired,
          companyName: error.response.data.companyName,
        });
      }
      
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Use createAction to define the logout action
export const logout = createAction('user/logout');
// Define an action to set user data (used by PrivateRoute)
export const setUserData = createAction<UserState['user']>('user/setUserData');

const userSlice = createSlice({
  name: 'user',
  initialState: initialState as UserState, // Cast initialState to UserState
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure the entire user object, including roleName and permissions, is stored
        if (action.payload.success && action.payload.user) {
          state.user = { 
            _id: action.payload.user._id,
            identityNo: action.payload.user.identityNo,
            firstName: action.payload.user.firstName,
            lastName: action.payload.user.lastName,
            email: action.payload.user.email,
            phone: action.payload.user.phone,
            position: action.payload.user.position,
            companyId: action.payload.user.companyId,
            role: action.payload.user.role,
            roleName: action.payload.user.roleName,
            permissions: action.payload.user.permissions || [],
            status: action.payload.user.status,
            subsectionId: action.payload.user.subsectionId,
            sectionId: action.payload.user.sectionId,
            departmentId: action.payload.user.departmentId,
            subsection: action.payload.user.subsection,
            section: action.payload.user.section,
            department: action.payload.user.department,
          };
          state.error = null;
        } else {
          // If login was not successful, but still reached fulfilled (e.g., due to API returning success: false)
          state.user = null;
          state.error = action.payload.message || 'Login failed.';
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed'; // Store error message
        state.user = null; // Clear user on login failure
      })
      .addCase(logout, (state) => {
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('companyId');
        localStorage.removeItem('sectionId');
        localStorage.removeItem('subsectionId');
      })
      .addCase(setUserData, (state, action) => {
        state.user = action.payload;
        // Also update local storage when user data is set
        if (action.payload) {
            saveUserToLocalStorage(action.payload);
            if (action.payload.companyId) {
                localStorage.setItem('companyId', action.payload.companyId);
            }
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('companyId');
        }
    });
  },
});

export default userSlice.reducer;