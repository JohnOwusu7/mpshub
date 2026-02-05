import { API_CONFIG } from './apiConfig';
import { handleApiError } from './errorHandling';
import axiosInstance from './axiosInstance';
import axios from 'axios';

// Define interfaces for API responses
interface LoginResponse {
  success: boolean;
  message: string;
  user: User; // Use the updated User interface
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

export interface CompanyRole {
  _id: string;
  roleName: string;
  description: string;
  permissions: string[];
  companyId: string;
  templateName?: string; // Template this role was created from (null for custom roles)
  isSystemRole?: boolean; // True for system roles like ADMIN, MANAGER
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  companyId: string;
  description?: string;
  isActive?: boolean; // New field
  createdAt: string;
  updatedAt: string;
}

export interface ISection {
  _id: string;
  name: string;
  departmentId: string;
  companyId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubsection {
  _id: string;
  name: string;
  sectionId: string;
  departmentId: string;
  companyId: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IService {
  _id: string;
  name: string;
  description?: string;
  companyId: string;
  sectionId: string | { _id: string; name: string; departmentId?: any };
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
    _id: string;
    identityNo: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string; // Optional since it's not always returned
    role: string; // This will now be the ObjectId of the CompanyRole
    roleName: string; // Denormalized role name
    permissions: string[]; // Permissions from the CompanyRole
    position: string;
    companyId: string;
    companyName: string; // Added companyName
    departmentId?: string; // New field for department, optional
    sectionId?: string; // New field for section, optional
    subsectionId?: string; // New field for subsection, optional
    status: 'ACTIVE' | 'BLOCKED';
    tokens?: any[]; // Optional
    createdAt: string;
    updatedAt: string;
}

export interface Company { // Export the Company interface
  _id: string;
  companyName: string;
  registrationDate: string;
  contactEmail: string;
  isActive: boolean;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscribedModules?: string[]; // New field for subscribed modules, optional for backward compatibility if not always present
  // Add other company-specific fields as needed based on your Company model
}

export interface PaymentTransaction {
  _id: string;
  companyId: string;
  companyName: string;
  amount: number;
  currency: string;
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash' | 'check' | 'other';
  paymentReference?: string;
  paymentDate: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  subscriptionPeriod: '1_month' | '3_months' | '6_months' | '12_months' | 'custom';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  modules: string[];
  processedBy: string;
  processedByName: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt: string;
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

export const getAllCompaniesApi = async (): Promise<Company[]> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.companies.endpoints.list);
    return response.data;
  } catch (error) {
    console.error('Error fetching all companies:', error);
    handleApiError(error);
    throw error;
  }
};

export const getCompanyByIdApi = async (companyId: string): Promise<Company> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.companies.endpoints.getById.replace(':companyId', companyId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching company with ID ${companyId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const updateCompanyApi = async (companyId: string, companyData: Partial<Company>): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.companies.endpoints.getById.replace(':companyId', companyId), companyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating company with ID ${companyId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const deleteCompanyApi = async (companyId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete(API_CONFIG.companies.endpoints.getById.replace(':companyId', companyId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting company with ID ${companyId}:`, error);
    handleApiError(error);
    throw error;
  }
};

// API call to update a company's subscribed modules
export const updateCompanyModulesApi = async (companyId: string, modules: string[]): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.companies.endpoints.updateModules.replace(':companyId', companyId), { modules });
    return response.data;
  } catch (error) {
    console.error(`Error updating modules for company with ID ${companyId}:`, error);
    handleApiError(error);
    throw error;
  }
};

// Company Role API Calls
export const createCompanyRoleApi = async (roleData: { roleName: string; description: string; permissions: string[] }): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.companies.endpoints.createRole, roleData);
        return response.data;
    } catch (error) {
        console.error('Error creating company role:', error);
        handleApiError(error);
        throw error;
    }
};

export const getAllCompanyRolesApi = async (): Promise<CompanyRole[]> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.companies.endpoints.listRoles);
        return response.data;
    } catch (error) {
        console.error('Error fetching all company roles:', error);
        handleApiError(error);
        throw error;
    }
};

export const getCompanyRoleByIdApi = async (roleId: string): Promise<CompanyRole> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.companies.endpoints.getRoleById.replace(':roleId', roleId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching company role with ID ${roleId}:`, error);
        handleApiError(error);
        throw error;
    }
};

export const updateCompanyRoleApi = async (roleId: string, roleData: Partial<CompanyRole>): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.put(API_CONFIG.companies.endpoints.updateRole.replace(':roleId', roleId), roleData);
        return response.data;
    } catch (error) {
        console.error(`Error updating company role with ID ${roleId}:`, error);
        handleApiError(error);
        throw error;
    }
};

export const deleteCompanyRoleApi = async (roleId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.delete(API_CONFIG.companies.endpoints.deleteRole.replace(':roleId', roleId));
        return response.data;
    } catch (error) {
        console.error(`Error deleting company role with ID ${roleId}:`, error);
        handleApiError(error);
        throw error;
    }
};

// Role Template API Calls
export interface RoleTemplate {
    roleName: string;
    description: string;
    isSystemRole: boolean;
}

export const getAllRoleTemplatesApi = async (): Promise<{ success: boolean; templates: RoleTemplate[] }> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.companies.endpoints.listRoleTemplates);
        return response.data;
    } catch (error) {
        console.error('Error fetching role templates:', error);
        handleApiError(error);
        throw error;
    }
};

export const activateRoleTemplateApi = async (templateName: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.companies.endpoints.activateRoleTemplate, { templateName });
        return response.data;
    } catch (error) {
        console.error(`Error activating role template ${templateName}:`, error);
        handleApiError(error);
        throw error;
    }
};

export const syncRoleWithTemplateApi = async (roleId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.companies.endpoints.syncRoleWithTemplate.replace(':roleId', roleId));
        return response.data;
    } catch (error) {
        console.error(`Error syncing role ${roleId} with template:`, error);
        handleApiError(error);
        throw error;
    }
};

// Department API Calls
export const createDepartmentApi = async (departmentData: { name: string; description?: string; isActive?: boolean; companyId?: string; }): Promise<IDepartment> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.departments.endpoints.create, departmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    handleApiError(error);
    throw error;
  }
};

export const getAllDepartmentsApi = async (companyId?: string): Promise<IDepartment[]> => {
  try {
    const url = companyId ? `${API_CONFIG.departments.endpoints.list}?companyId=${companyId}` : API_CONFIG.departments.endpoints.list;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all departments:', error);
    handleApiError(error);
    throw error;
  }
};

export const getDepartmentByIdApi = async (departmentId: string): Promise<IDepartment> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.departments.endpoints.getById.replace(':id', departmentId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching department with ID ${departmentId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const updateDepartmentApi = async (departmentId: string, departmentData: Partial<IDepartment>): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.departments.endpoints.update.replace(':id', departmentId), departmentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating department with ID ${departmentId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const deleteDepartmentApi = async (departmentId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete(API_CONFIG.departments.endpoints.delete.replace(':id', departmentId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting department with ID ${departmentId}:`, error);
    handleApiError(error);
    throw error;
  }
};

// Section API Calls
export const createSectionApi = async (sectionData: { name: string; departmentId: string; companyId?: string; description?: string; }): Promise<ISection> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.sections.endpoints.create, sectionData);
    return response.data;
  } catch (error) {
    console.error('Error creating section:', error);
    handleApiError(error);
    throw error;
  }
};

export const getAllSectionsByDepartmentApi = async (departmentId: string, companyId?: string): Promise<ISection[]> => {
  try {
    const url = companyId ? `${API_CONFIG.sections.endpoints.listByDepartment.replace(':departmentId', departmentId)}?companyId=${companyId}` : API_CONFIG.sections.endpoints.listByDepartment.replace(':departmentId', departmentId);
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sections for department ID ${departmentId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const getSectionByIdApi = async (sectionId: string): Promise<ISection> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.sections.endpoints.getById.replace(':id', sectionId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching section with ID ${sectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const updateSectionApi = async (sectionId: string, sectionData: Partial<ISection>): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.sections.endpoints.update.replace(':id', sectionId), sectionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating section with ID ${sectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const deleteSectionApi = async (sectionId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete(API_CONFIG.sections.endpoints.delete.replace(':id', sectionId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting section with ID ${sectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

// Subsection API Calls
export const createSubsectionApi = async (subsectionData: { name: string; sectionId: string; companyId?: string; description?: string; }): Promise<ISubsection> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.subsections.endpoints.create, subsectionData);
    return response.data;
  } catch (error) {
    console.error('Error creating subsection:', error);
    handleApiError(error);
    throw error;
  }
};

export const getAllSubsectionsBySectionApi = async (sectionId: string, companyId?: string): Promise<ISubsection[]> => {
  try {
    const url = companyId ? `${API_CONFIG.subsections.endpoints.listBySection.replace(':sectionId', sectionId)}?companyId=${companyId}` : API_CONFIG.subsections.endpoints.listBySection.replace(':sectionId', sectionId);
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subsections for section ID ${sectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const getSubsectionByIdApi = async (subsectionId: string): Promise<ISubsection> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.subsections.endpoints.getById.replace(':id', subsectionId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching subsection with ID ${subsectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const updateSubsectionApi = async (subsectionId: string, subsectionData: Partial<ISubsection>): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.subsections.endpoints.update.replace(':id', subsectionId), subsectionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating subsection with ID ${subsectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const deleteSubsectionApi = async (subsectionId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete(API_CONFIG.subsections.endpoints.delete.replace(':id', subsectionId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting subsection with ID ${subsectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

// Service API Calls
export const createServiceApi = async (serviceData: { name: string; sectionId: string; companyId?: string; description?: string; isActive?: boolean }): Promise<IService> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.services.endpoints.create, serviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    handleApiError(error);
    throw error;
  }
};

export const getAllServicesApi = async (companyId?: string, sectionId?: string): Promise<IService[]> => {
  try {
    let url = API_CONFIG.services.endpoints.list;
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (sectionId) params.append('sectionId', sectionId);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    handleApiError(error);
    throw error;
  }
};

export const getServicesBySectionApi = async (sectionId: string): Promise<IService[]> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.services.endpoints.listBySection.replace(':sectionId', sectionId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for section ID ${sectionId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const getServiceByIdApi = async (serviceId: string): Promise<IService> => {
  try {
    const response = await axiosInstance.get(API_CONFIG.services.endpoints.getById.replace(':id', serviceId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const updateServiceApi = async (serviceId: string, serviceData: Partial<IService>): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put(API_CONFIG.services.endpoints.update.replace(':id', serviceId), serviceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating service with ID ${serviceId}:`, error);
    handleApiError(error);
    throw error;
  }
};

export const deleteServiceApi = async (serviceId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete(API_CONFIG.services.endpoints.delete.replace(':id', serviceId));
    return response.data;
  } catch (error) {
    console.error(`Error deleting service with ID ${serviceId}:`, error);
    handleApiError(error);
    throw error;
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

export const forgotPassword = async (identityNo: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.forgotPassword, { identityNo: identityNo?.trim() });
    return response.data;
  } catch (error) {
    console.error('Forgot password failed:', error);
    handleApiError(error);
    throw error;
  }
};

/** Send maintenance/update email to all company users (SUPER-ADMIN, ADMIN only). */
export const sendMaintenanceEmail = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.send, {});
    return response.data;
  } catch (error) {
    console.error('Send maintenance email failed:', error);
    handleApiError(error);
    throw error;
  }
};

/** Send "app ready" email to all company users (SUPER-ADMIN, ADMIN only). */
export const sendReadyEmail = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(API_CONFIG.users.endpoints.ready, {});
    return response.data;
  } catch (error) {
    console.error('Send ready email failed:', error);
    handleApiError(error);
    throw error;
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

// API call to get all users across all companies (SUPER-ADMIN only)
export const getAllUsersAcrossCompaniesApi = async (): Promise<User[]> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.users.endpoints.listAll);
        return response.data;
    } catch (error) {
        console.error('Error fetching all users across companies:', error);
        handleApiError(error);
        throw error;
    }
};

// Payment Transaction API Calls
export const createPaymentTransactionApi = async (paymentData: Partial<PaymentTransaction>): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.paymentTransactions.endpoints.create, paymentData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment transaction:', error);
        handleApiError(error);
        throw error;
    }
};

export const getAllPaymentTransactionsApi = async (filters?: {
    companyId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}): Promise<PaymentTransaction[]> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.paymentTransactions.endpoints.list, { params: filters });
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching payment transactions:', error);
        handleApiError(error);
        throw error;
    }
};

export const getPaymentTransactionByIdApi = async (paymentId: string): Promise<PaymentTransaction> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.paymentTransactions.endpoints.getById.replace(':paymentId', paymentId));
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching payment transaction:', error);
        handleApiError(error);
        throw error;
    }
};

export const confirmPaymentApi = async (paymentId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.post(API_CONFIG.paymentTransactions.endpoints.confirm.replace(':paymentId', paymentId));
        return response.data;
    } catch (error) {
        console.error('Error confirming payment:', error);
        handleApiError(error);
        throw error;
    }
};

export const updatePaymentTransactionApi = async (paymentId: string, updateData: Partial<PaymentTransaction>): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.put(
            API_CONFIG.paymentTransactions.endpoints.update.replace(':paymentId', paymentId),
            updateData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating payment transaction:', error);
        handleApiError(error);
        throw error;
    }
};

export const deletePaymentTransactionApi = async (paymentId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.delete(API_CONFIG.paymentTransactions.endpoints.delete.replace(':paymentId', paymentId));
        return response.data;
    } catch (error) {
        console.error('Error deleting payment transaction:', error);
        handleApiError(error);
        throw error;
    }
};

export const getPaymentStatisticsApi = async (filters?: {
    startDate?: string;
    endDate?: string;
}): Promise<any> => {
    try {
        const response = await axiosInstance.get(API_CONFIG.paymentTransactions.endpoints.statistics, { params: filters });
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        handleApiError(error);
        throw error;
    }
};

// API calls for user actions (block, unblock, delete)
export const blockUserApi = async (userId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.put(API_CONFIG.users.endpoints.active.replace(':userId', userId));
        return response.data;
    } catch (error) {
        console.error(`Error blocking user with ID ${userId}:`, error);
        handleApiError(error);
        throw error;
    }
};

export const unBlockUserApi = async (userId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.put(API_CONFIG.users.endpoints.inActive.replace(':userId', userId));
        return response.data;
    } catch (error) {
        console.error(`Error unblocking user with ID ${userId}:`, error);
        handleApiError(error);
        throw error;
    }
};

export const deleteUserApi = async (userId: string): Promise<ApiResponse> => {
    try {
        const response = await axiosInstance.delete(API_CONFIG.users.endpoints.delete.replace(':userId', userId));
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error);
        handleApiError(error);
        throw error;
    }
};


