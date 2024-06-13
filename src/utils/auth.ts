import { API_CONFIG } from '../Api/apiConfig';

export const checkTokenValidity = async () => {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.users.endpoints.getUser}`);
        if (response.ok) {
            return false; // Token is not expired
        } else {
            return true; // Token is expired
        }
    } catch (error) {
        console.error('Error checking token validity:', error);
        return true; // Error occurred, consider token expired
    }
};
