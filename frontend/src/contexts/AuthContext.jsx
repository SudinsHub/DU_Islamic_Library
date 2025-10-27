import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/ApiCall';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state for auth check
  const [error, setError] = useState(null); // To store any authentication errors

  // Using useCallback for functions that are passed down or used in useEffect dependencies
  const logout = useCallback(async () => {
    // Clear local storage first to ensure immediate local logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');

    // Only attempt API call if a token existed
    if (token) {
      try {
        await apiCall('/api/logout', {}, 'POST', token);
      } catch (err) {
        console.warn('Logout API call failed, but local state cleared anyway:', err);
      }
    }
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    setToken(null);
    setError(null);
  }, [token]); // token is a dependency for the API call

  const fetchUser = useCallback(async (authToken) => { // Accept token as argument
    if (!authToken) return null; // Use the provided token
    try {
      const response = await apiCall('/api/user', {}, 'GET', authToken); // Use authToken
      if (response) { 
        setUser(response);
        setIsAuthenticated(true); // Set authenticated upon successful user fetch
        return response;
      } else {
        console.warn('User API returned no user or invalid user structure:', response);
        // If API returns no user or malformed user, treat as invalid token
        logout(); // Call logout to clear state and local storage
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      // Check for specific HTTP status codes if apiCall returns them (e.g., 401 Unauthorized)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         console.log("Token invalid or expired, logging out.");
         logout(); // If unauthorized, log out
      } else {
         // Other errors (network, server issues)
         setError('Failed to connect to server or fetch user data.');
      }
      return null;
    }
  }, [logout]); // logout is a dependency for fetchUser

  useEffect(() => {
    const initializeAuth = async () => {
      // Start loading indicator
      setIsLoading(true);

      const storedToken = localStorage.getItem('authToken');
      const storedUserType = localStorage.getItem('userType');

      if (storedToken) {
        // Set token and userType immediately based on local storage
        setToken(storedToken);
        setUserType(storedUserType);
        // Do NOT set isAuthenticated=true here. Let fetchUser confirm token validity.

        // Attempt to fetch user details with the stored token
        const fetchedUser = await fetchUser(storedToken);

        if (fetchedUser) {
          // If user was successfully fetched, isAuthenticated is already true via fetchUser
        } else {
          // If fetchUser failed (e.g., invalid token), it would have called logout.
          // So isAuthenticated would be false now.
        }
      } else {
        // No token in local storage, so not authenticated
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setUserType(null);
      }
      // ONLY set isLoading to false AFTER all asynchronous checks are complete
      setIsLoading(false);
    };

    initializeAuth();
  }, [fetchUser]); // fetchUser is a dependency for this effect

  // Login function
  const login = useCallback(async (type, email, password) => {
    try {
      const endpoint = `/api/login/${type}`;
      const data = { email, password };
      const response = await apiCall(endpoint, data, 'POST');

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setUserType(type);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', type);
        return true;
      }
      setError(response.message || 'Login failed.');
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'An error occurred during login.');
      return false;
    }
  }, []);

  // Register function (similar to your existing one)
  const register = useCallback(async (type, userData) => {
    try {
      const endpoint = `/api/register/${type}`;
      const response = await apiCall(endpoint, userData, 'POST');

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setUserType(type);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userType', type);
        return true;
      }
      setError(response.message || 'Registration failed.');
      return false;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'An error occurred during registration.');
      return false;
    }
  }, []);


  const authContextValue = {
    isAuthenticated,
    user,
    userType,
    token,
    isLoading, // Crucial: expose isLoading to consumers
    error,
    login,
    register,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};