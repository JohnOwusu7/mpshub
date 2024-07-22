import { API_CONFIG } from './apiConfig';
import { handleApiError } from './errorHandling';
import axiosInstance from './axiosInstance';

// Define interfaces for API responses
interface LoginResponse {
  success: boolean;
  message: string;
  user: any; // Replace 'any' with the appropriate user type
  token: string;
}

interface LogoutResponse {
  message: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface AddressData {
  // Define the structure of addressData according to your requirements
}

interface SingleFormData {
  // Define the structure of singleFormData according to your requirements
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

interface ReportFormData {
    tasksAccomplished: string;
    ongoingTask: string;
    issuesConcerns: string;
    plansNextDay: string;
    additionalComments: string;
    shift: string;
}
interface Report {
    tasksAccomplished: string;
    ongoingTask: string;
    issuesConcerns: string;
    plansNextDay: string;
    additionalComments: string;
    shift: string;
    name: string;
    section: string;
    date: string;
}

export const loginApi = async (identityNo: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.login, {
      identityNo,
      password,
    });

    console.log('API Response:', response);

    const { success, message, user, token } = response.data;

    return { success, message, user, token };
  } catch (error: any) {
    console.error('API call error:', error);
    handleApiError(error);
    throw error; // or return an appropriate response
  }
};


// Logout API call
export const logoutApi = async (): Promise<string> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.logout);
    const { message } = response.data;
    console.log('Logout success:', message);
    return message;
  } catch (error: any) {
    console.error('Logout failed:', error.message);
    handleApiError(error);
    throw error
  }
};

export const changePassword = async (passwordData: ChangePasswordPayload): Promise<ApiResponse> => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.changePassword, passwordData, config);
    return response.data;
  } catch (error) {
    console.error('Change password failed:', error);
    handleApiError(error);
    throw error; // or return an appropriate response
  }
};


// Add Address API call
export const addAddress = async (addressData: AddressData): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.ipAddress.endpoints.add, addressData);
    console.log('API Response:', response);

    const { success, message } = response.data;
    return { success, message };
  } catch (error: any) {
    console.error('API call error:', error);
    handleApiError(error);
    throw error;
  }
};

// Inventory Add API call
export const inventoryAdd = async (singleFormData: SingleFormData): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(`${API_CONFIG.baseURL}${API_CONFIG.equipment.endpoints.add}`, singleFormData);
    console.log('API Response:', response);

    const { success, message } = response.data;
    return { success, message };
  } catch (error: any) {
    console.error('API call error:', error);
    handleApiError(error);
    throw error;
  }
};

// Inventory Bulk API call
const token = localStorage.getItem('token');

export const inventoryBulk = async (formData: SingleFormData): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.equipment.endpoints.bulk, formData);
    console.log('API Response:', response);

    const { success, message } = response.data;
    return { success, message };
  } catch (error: any) {
    console.error('API call error:', error);
    handleApiError(error);
    throw error;
  }
};

export const addReport = async (data: ReportFormData, token: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.reports.endpoints.add,  data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Report Response', response);
        const { success, message } = response.data;
        return { success, message };
    } catch (error) {
        handleApiError(error);
        throw error;
    }
};

export const fetchReports = async (): Promise<Report[]> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.reports.endpoints.list,);
        return response.data;
    } catch (error) {
        console.error('Error fetching reports:', error);
        handleApiError(error);
        throw error;
    }
};

export const getFilteredReports = async (keyword: string, startDate: string, endDate: string): Promise<Report[]> => {
    try {
      const response = await axiosInstance.get(API_CONFIG.reports.endpoints.filter, {
        params: {
          keyword,
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };


