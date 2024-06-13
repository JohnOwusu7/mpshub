import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const setupInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Modify request config if needed (e.g., add headers)
      return config;
    },
    (error: AxiosError) => {
      // Handle request error
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      // Do something with successful response data
      return response;
    },
    (error: AxiosError) => {
      // Do something with response error
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.error('Unauthorized access. Redirecting to login...');
        // Add your logic to redirect the user to the login page
      }

      // For other errors, log and reject the promise
      console.error('Error in response interceptor:', error);
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
