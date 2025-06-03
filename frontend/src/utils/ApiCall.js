import { toast } from 'react-toastify';

// Define the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL // || 'http://localhost:8000/api'; 

  /**
   * Generic API call helper function.
   *
   * @param {string} endpoint - The API endpoint (e.g., '/login/admin').
   * @param {object} data - The request body data.
   * @param {string} method - HTTP method (e.g., 'POST', 'GET').
   * @param {string} authToken - Optional: JWT token for authenticated requests.
   * @returns {Promise<object>} - The JSON response from the API.
   */
  export const apiCall = async (endpoint, data, method = 'POST', token = null) => {

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: (method == "GET") ? null : JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., validation errors, unauthorized)
        const errorMessage = result.message || 'An unknown error occurred.';
        throw new Error(errorMessage);
      }
      return result;
    } catch (err) {
      console.error(`API Error: ${err.message}`);
      toast.error(err.message);
      throw err; // Re-throw to allow calling functions to catch
    }
  };