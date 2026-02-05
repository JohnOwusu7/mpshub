import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanyByIdApi, Company } from '../Api/api';

interface CompanyState {
  companyInfo: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companyInfo: null,
  loading: false,
  error: null,
};

// Async thunk to fetch company details
export const fetchCompanyInfo = createAsyncThunk(
  'company/fetchCompanyInfo',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const data = await getCompanyByIdApi(companyId);
      return data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        // 403 is expected for some users - return null instead of error
        return null;
      }
      return rejectWithValue(error.message || 'Failed to fetch company info');
    }
  }
);

// Action to update company info (e.g., when modules are updated)
export const updateCompanyInfo = createAsyncThunk(
  'company/updateCompanyInfo',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const data = await getCompanyByIdApi(companyId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update company info');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCompanyInfo: (state) => {
      state.companyInfo = null;
      state.error = null;
    },
    // Action to manually update subscribed modules (optimistic update)
    updateSubscribedModules: (state, action) => {
      if (state.companyInfo) {
        state.companyInfo.subscribedModules = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch company info
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.companyInfo = null; // Set to null on error
      })
      // Update company info
      .addCase(updateCompanyInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.companyInfo = action.payload;
        state.error = null;
      })
      .addCase(updateCompanyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCompanyInfo, updateSubscribedModules } = companySlice.actions;
export default companySlice.reducer;

