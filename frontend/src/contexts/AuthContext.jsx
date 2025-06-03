import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiCall } from '../utils/ApiCall'; 
const AuthContext = createContext(null);
/**
 * AuthProvider component to manage authentication state and provide it to children.
 * It handles login, logout, and registration for different user types.
 *
 * @param {object} { children } - React children to be rendered within the provider.
 */
export const AuthProvider = ({ children }) => {
  // State variables to hold authentication information
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // e.g., 'admin', 'reader', 'volunteer'
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state for auth check
  const [error, setError] = useState(null); // To store any authentication errors

  // Effect to check for existing authentication on component mount
  // This could be extended to check local storage for a token for persistence
  useEffect(() => {
    const tempToken = localStorage.getItem('authToken');
    const tempUserType = localStorage.getItem('userType');
    if (tempToken) {  
      setToken(tempToken);
      setUserType(tempUserType);
      setIsAuthenticated(true);
    }

    setIsLoading(false); // Set loading to false after initial check
  }, []);


  /**
   * Handles user login for a specific user type.
   *
   * @param {string} type - The type of user ('admin', 'reader', 'volunteer').
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<boolean>} - True if login is successful, false otherwise.
   */
  const login = async (type, email, password) => {
    try {
      const endpoint = `/api/login/${type}`;
      const data = { email, password };
      const response = await apiCall(endpoint, data, 'POST', token);

      if (response.token && response.user) {
        setToken(response.token);
        // setUser(response.user);
        setUserType(type);
        setIsAuthenticated(true);
        // In a real app, you'd store the token in localStorage/sessionStorage here
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', type);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      // Error state is already set by apiCall
      return false;
    }
  };

  /**
   * Handles user registration for a specific user type.
   *
   * @param {string} type - The type of user ('admin', 'reader', 'volunteer').
   * @param {object} userData - Object containing user registration data (name, email, password, etc.).
   * @returns {Promise<boolean>} - True if registration is successful, false otherwise.
   */
  const register = async (type, userData) => {
    try {
      const endpoint = `/api/register/${type}`;
      const response = await apiCall(endpoint, userData);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setUserType(type);
        setIsAuthenticated(true);
        // In a real app, you'd store the token in localStorage/sessionStorage here
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', type);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Registration failed:', err);
      // Error state is already set by apiCall
      return false;
    }
  };

  /**
   * Handles user logout.
   * It revokes the token on the backend and clears local state.
   */
  const logout = async () => {
    if (!token) {
      // Already logged out or no token exists
      setIsAuthenticated(false);
      setUser(null);
      setUserType(null);
      setToken(null);
      setError(null);
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('userType');
      return;
    }

    try {
      // Send logout request to API to revoke the token
      await apiCall('/api/logout', {}, 'POST', token);
    } catch (err) {
      console.warn('Logout API call failed, but clearing local state anyway:', err);
      // Continue to clear local state even if API call fails
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setUserType(null);
      setToken(null);
      setError(null);
      // Clear token from local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
    }
  };

  /**
   * Fetches the authenticated user's details.
   * This can be used to refresh user data or verify token validity.
   *
   * @returns {Promise<object|null>} - The user object if successful, null otherwise.
   */
  const fetchUser = async () => {
    if (!token) return null;
    try {
      const response = await apiCall('/user', {}, 'GET', token);
      if (response) {
        setUser(response);
        return response;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      // If fetching user fails, it might mean the token is invalid, so log out
      logout();
      return null;
    }
  };


  // The value provided by the context to its consumers
  const authContextValue = {
    isAuthenticated,
    user,
    userType,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
  };

  // Render the AuthContext.Provider with the value
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 *
 * @returns {object} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


/**
// Example component using the hook
import React from 'react';
import { useAuth } from './AuthContext'; // Adjust path as needed

function Dashboard() {
  const { isAuthenticated, user, userType, isLoading, error, logout } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name} ({userType})!</h1>
      <p>Your email: {user?.email}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Logout
      </button>

      {userType === 'admin' && (
        <div className="mt-6 p-4 border rounded-md bg-blue-100">
          <p>Admin specific content here.</p>
        </div>
      )}
      {userType === 'reader' && (
        <div className="mt-6 p-4 border rounded-md bg-green-100">
          <p>Reader specific content here.</p>
        </div>
      )}
      {userType === 'volunteer' && (
        <div className="mt-6 p-4 border rounded-md bg-yellow-100">
          <p>Volunteer specific content here.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
*/
