import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const setupInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      const companyId = localStorage.getItem('companyId'); // Retrieve companyId from localStorage
      console.log('Token retrieved from localStorage:', token); // DEBUG LOG
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (companyId) {
        config.headers.companyid = companyId; // Attach companyId to headers for multi-tenancy
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Check for subscription warning header
      const warning = response.headers['x-subscription-warning'];
      if (warning) {
        console.warn('Subscription Warning:', warning);
        // You can show a toast notification here if needed
      }
      return response;
    },
    (error: AxiosError) => {
      // Handle subscription expiration errors
      if (error.response && error.response.status === 403) {
        const errorData = error.response.data as any;
        
        // Check if it's a subscription-related error
        if (errorData?.code === 'SUBSCRIPTION_EXPIRED' ||
            errorData?.code === 'COMPANY_INACTIVE' ||
            errorData?.code === 'SUBSCRIPTION_NOT_CONFIGURED') {
          // Store subscription info and clear session for expired/inactive
          if (errorData.subscriptionEndDate) {
            localStorage.setItem('subscriptionEndDate', errorData.subscriptionEndDate);
          }
          if (errorData.daysExpired) {
            localStorage.setItem('daysExpired', errorData.daysExpired.toString());
          }
          if (errorData.companyName) {
            localStorage.setItem('companyName', errorData.companyName);
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('companyId');
          if (window.location.pathname !== '/auth/subscription-expired') {
            window.location.href = '/auth/subscription-expired';
          }
          return Promise.reject(error);
        }

        if (errorData?.code === 'MODULE_NOT_SUBSCRIBED') {
          // User is valid but tried to access a module they don't have – redirect to subscription status only
          if (window.location.pathname !== '/users/subscription-status') {
            window.location.href = '/users/subscription-status';
          }
          return Promise.reject(error);
        }
      }
      
      // Handle unauthorized access (401)
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access. Redirecting to login...');
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('companyId');
        // Redirect to login if not already there
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/auth/login') {
          window.location.href = '/auth';
        }
      }

      // For other errors, log and reject the promise
      console.error('Error in response interceptor:', error);
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
