import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import LoginForm from './LoginPage'; // Adjust path as needed
import RegistrationForm from './RegistrationForm'; // Adjust path as needed
import VolunteerDashboard from '@/pages/VolunteerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';


/**
 * Main authentication page component.
 * Allows switching between login and registration forms for different user types,
 * determined by the URL parameter.
 */
function AuthPage() {
    const { isAuthenticated, isLoading, userType: authenticatedUserType, user } = useAuth();
    const { userType } = useParams(); // Get userType from URL parameters
    const navigate = useNavigate(); // For redirection
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Validate the userType from the URL and set it for the forms
    const validUserTypes = ['reader', 'volunteer', 'admin'];
    const selectedUserType = validUserTypes.includes(userType) ? userType : 'reader'; // Default to 'reader' if invalid

    // Effect to redirect if an invalid userType is provided in the URL
    useEffect(() => {
        if (!validUserTypes.includes(userType)) {
            // Optionally redirect to a default or error page, or just keep 'reader' as default
            // For now, it defaults to 'reader' internally, but you could redirect:
            navigate('/user/reader', { replace: true });
        }
    }, [userType, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-lg font-semibold text-gray-700">Loading authentication...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect to the appropriate dashboard based on the authenticated user's actual type
        // This prevents a logged-in admin from trying to access /user/reader page.
        if (authenticatedUserType === 'volunteer') {
            if( user && user.isVerified === false){
                // If the user is a volunteer but not verified, show him a message that you are not verified yet contact with Dhaka University Islamic Library Authorities
                return (
                    <div className="flex items-center justify-center min-h-screen bg-gray-100">
                        <div className="p-6 bg-white rounded-lg shadow-md text-red-600">
                            <h2 className="text-xl font-bold mb-4">Verification Pending</h2>
                            <p>Your account is not verified yet. Please contact the Dhaka University Islamic Library authorities for verification.</p>
                        </div>
                    </div>
                );
            }
            return <VolunteerDashboard />;
        }
        if (authenticatedUserType === 'admin') {
            return <AdminDashboard />;
        }
        // Assuming 'reader' is the default for general users if no specific dashboard
        // return <ReaderDashboard />; // Assuming you'll have a ReaderDashboard now
        // redirecct to browse books page
        navigate('/browse-books', { replace: true });
        return null; // Prevent rendering AuthPage if already authenticated
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-4xl md:max-w-4xl flex flex-col md:flex-row">
                {/* Left Side: Marketing/Info Section */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col justify-start items-center text-center md:text-left">
                    <div className="mb-6 mx-auto md:mx-0">
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
                        Join our community to explore a vast collection of books and contribute as a {selectedUserType}.
                    </p>
                </div>

                {/* Right Side: Authentication Forms */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-5 text-center">
                        {isLoginMode ? `Login as ${selectedUserType}` : `Register as ${selectedUserType}`}
                    </h3>

                    {/* Removed User Type Selector Buttons */}
                    {/* The user type is now determined by the URL */}

                    {/* Render Login or Registration Form */}
                    {isLoginMode ? (
                        <LoginForm userType={selectedUserType} />
                    ) : (
                        <RegistrationForm userType={selectedUserType} />
                    )}

                    {/* Switch between Login and Register */}
                    <div className="mt-6 text-center text-gray-600 text-sm">
                        {isLoginMode || !(selectedUserType==='admin') ? (
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