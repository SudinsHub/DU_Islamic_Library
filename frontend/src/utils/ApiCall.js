import { toast } from 'react-toastify';

// Define the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Generic API call helper function.
 *
 * @param {string} endpoint - The API endpoint (e.g., '/api/books').
 * @param {object|FormData} data - The request body data (can be a plain object or FormData).
 * @param {string} method - HTTP method (e.g., 'POST', 'GET').
 * @param {string} token - Optional: JWT token for authenticated requests.
 * @returns {Promise<object>} - The JSON response from the API.
 */
export const apiCall = async (endpoint, data, method = 'POST', token = null) => {
    try {
        const fetchOptions = {
            method: method,
            headers: {
                'Accept': 'application/json', // Always accept JSON response
            },
        };

        if (token) {
            fetchOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        // --- CRUCIAL CHANGE: Handle FormData vs. JSON data ---
        if (method !== "GET" && data) { // Only set body for non-GET requests with data
            if (data instanceof FormData) {
                // If `data` is FormData, pass it directly as the body.
                // DO NOT set 'Content-Type' header here. 'fetch' will handle 'multipart/form-data' automatically.
                fetchOptions.body = data;
            } else {
                // For regular JSON data (plain objects), stringify and set Content-Type.
                fetchOptions.body = JSON.stringify(data);
                fetchOptions.headers['Content-Type'] = 'application/json';
            }
        }
        // --- END CRUCIAL CHANGE ---

        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

        // Parse response as JSON (even for errors, Laravel typically sends JSON errors)
        let result = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // Handle cases where the response might not be JSON (e.g., 204 No Content)
            result = { success: response.ok, message: response.statusText };
            if (response.status === 204) {
                result.message = 'Operation successful, no content returned.';
            }
        }

        if (!response.ok) {
            // Construct a meaningful error message
            const errorMessage = result.message || response.statusText || 'An unknown error occurred.';
            
            // Create a custom error object to include validation errors if present
            const errorToThrow = new Error(errorMessage);
            errorToThrow.statusCode = response.status;
            errorToThrow.errors = result.errors || null; // Attach Laravel validation errors

            throw errorToThrow;
        }

        return result;

    } catch (err) {
        console.error(`API Error: ${err.message}`, err); // Log the full error object for better debugging
        toast.error(err.message); // Display a general error toast
        throw err; // Re-throw to allow calling functions to catch and handle specific errors (e.g., validation)
    }
};