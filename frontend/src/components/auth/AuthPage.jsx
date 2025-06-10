import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import LoginForm from './LoginPage'; // Adjust path as needed
import RegistrationForm from './RegistrationForm'; // Adjust path as needed
import VolunteerDashboard from '@/pages/VolunteerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

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
      if (userType === 'volunteer') {
          return <VolunteerDashboard />;
      }
      if (userType === 'admin') {
          return <AdminDashboard />;
      }
      return <Dashboard />;
  }

  return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl md:max-w-4xl flex flex-col md:flex-row"> {/* Adjusted max-w-xl to max-w-4xl, and removed lg:max-w-6xl */}
              {/* Left Side: Marketing/Info Section */}
              <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col justify-start items-center text-center md:text-left"> {/* Removed items-center from here */}
                    <div className="mb-6 mx-auto md:mx-0"> {/* Added mx-auto here to center the logo div itself */}
                        {/* DUIL Logo placeholder */}
                        <div className="h-25 w-25 mr-2 flex items-center justify-center rounded-sm">
                          {/* Your SVG Logo */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84" fill="none">
                            <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
                            <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
                            <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
                            <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
                            <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
                          </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                        Register & verify to access the library.
                    </h2>
                    <p className="text-gray-600 text-base">
                        Join our community to explore a vast collection of books and contribute as a reader or volunteer.
                    </p>
              </div>


              {/* Right Side: Authentication Forms */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center"> {/* Adjusted padding p-6 md:p-8 */}
                  <h3 className="text-3xl font-bold text-gray-800 mb-5 text-center"> {/* Adjusted font size and margin */}
                      {isLoginMode ? 'Login to your account' : 'Create a new account'}
                  </h3>

                  {/* User Type Selector */}
                  <div className="mb-5 flex flex-wrap justify-center gap-3"> {/* Adjusted margin and gap */}
                      <button
                          onClick={() => setSelectedUserType('reader')}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${ // Adjusted padding and font size
                              selectedUserType === 'reader'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                          Reader
                      </button>
                      <button
                          onClick={() => setSelectedUserType('volunteer')}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${ // Adjusted padding and font size
                              selectedUserType === 'volunteer'
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                          Volunteer
                      </button>
                      <button
                          onClick={() => setSelectedUserType('admin')}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${ // Adjusted padding and font size
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
                  <div className="mt-6 text-center text-gray-600 text-sm"> {/* Adjusted margin and font size */}
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
      </div>
  );
}

export default AuthPage;
