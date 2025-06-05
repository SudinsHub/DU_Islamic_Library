import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import LoginForm from './LoginPage'; // Adjust path as needed
import RegistrationForm from './RegistrationForm'; // Adjust path as needed
import VolunteerDashboard from '@/pages/VolunteerDashboard';

// Dummy Dashboard, R lagbe na
const Dashboard = () => {
  const { isAuthenticated, user, userType, isLoading, error, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading authentication...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This component should only render if authenticated
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          Welcome, {user?.name} ({userType})!
        </h1>
        <p className="text-gray-600 mb-6">Your email: {user?.email}</p>
        <button
          onClick={logout}
          className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Logout
        </button>

        {userType === 'admin' && (
          <div className="mt-8 p-6 border border-blue-200 rounded-lg bg-blue-50 text-blue-800">
            <h2 className="text-xl font-bold mb-2">Admin Panel Access</h2>
            <p>You have full administrative privileges. Manage users, content, and system settings.</p>
          </div>
        )}
        {userType === 'reader' && (
          <div className="mt-8 p-6 border border-green-200 rounded-lg bg-green-50 text-green-800">
            <h2 className="text-xl font-bold mb-2">Reader Dashboard</h2>
            <p>Explore a vast collection of books and articles. Track your reading progress and manage your wishlist.</p>
          </div>
        )}
        {userType === 'volunteer' && (
          <div className="mt-8 p-6 border border-yellow-200 rounded-lg bg-yellow-50 text-yellow-800">
            <h2 className="text-xl font-bold mb-2">Volunteer Hub</h2>
            <p>View and accept tasks to help the community. Your contributions are highly valued!</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main authentication page component.
 * Allows switching between login and registration forms for different user types.
 */
function AuthPage() {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for register
  const [selectedUserType, setSelectedUserType] = useState('reader'); // Default to reader

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading authentication...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    if(userType === 'volunteer') {
      return <VolunteerDashboard />;
    }
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-center mb-8">
          {/* DUIL Logo placeholder */}
          <div className="bg-green-600 p-3 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          {isLoginMode ? 'Login to access all features.' : 'Register & verify to access the library.'}
        </h2>

        {/* User Type Selector */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setSelectedUserType('reader')}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
              selectedUserType === 'reader'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reader
          </button>
          <button
            onClick={() => setSelectedUserType('volunteer')}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
              selectedUserType === 'volunteer'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Volunteer
          </button>
          <button
            onClick={() => setSelectedUserType('admin')}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
              selectedUserType === 'admin'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Render Login or Registration Form */}
        {isLoginMode ? (
          <LoginForm userType={selectedUserType} />
        ) : (
          <RegistrationForm userType={selectedUserType} />
        )}

        {/* Switch between Login and Register */}
        <div className="mt-8 text-center text-gray-600">
          {isLoginMode ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLoginMode(false)}
                className="text-green-600 font-semibold hover:underline transition-colors duration-200"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsLoginMode(true)}
                className="text-blue-600 font-semibold hover:underline transition-colors duration-200"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
