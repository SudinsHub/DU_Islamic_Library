import React, { useState, useEffect } from 'react';
import InsertBooks from '@/components/admin/AdminInsertBook';
import PendingRequests from '@/components/admin/AdminPendingRequests';
import LendingBooks from '@/components/admin/AdminLendingBooks';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and configured

const AdminDashboard = () => {
    // State to manage which section is currently active
    const [activeSection, setActiveSection] = useState('InsertBooks'); // Default active section
    // State to store the admin's name, initialized with a placeholder
    const [adminName, setAdminName] = useState('Admin');
    // Access authentication token from AuthContext
    const { user } = useAuth();

    // Effect hook to fetch the admin's name when the component mounts or token changes
    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                setAdminName(user.name || 'Admin');
            } catch (error) {
                console.error('Error fetching admin profile:', error);
                // Display an error toast notification
                toast.error('Failed to load admin profile.');
            }
        };

        // Execute the fetch function
        fetchAdminProfile();
    }, [user]);
    return (
        // Main container for the dashboard, ensuring a minimum height and light gray background
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            {/* Inner container for the dashboard content, centered and styled as a white card */}
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                {/* Dashboard Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
                    {/* Welcome message with admin's name */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                        Welcome, {adminName}!
                    </h1>
                    {/* Placeholder for any future admin-specific header elements or summaries */}
                </div>

                {/* Navigation Section (Tabs) */}
                <nav className="mb-8 overflow-x-auto">
                    <ul className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start gap-2 sm:gap-4 text-center text-sm sm:text-base font-medium border-b border-gray-200">
                        <li>
                            <button
                                onClick={() => setActiveSection('InsertBooks')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'manageBooks'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500' // Active state styles
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800' // Inactive state styles
                                }`}
                            >
                                Insert Books
                            </button>
                        </li>
                        {/* Button for 'Manage Users' section */}
                        <li>
                            <button
                                onClick={() => setActiveSection('PendingRequests')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'PendingRequests'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                Pending Requests
                            </button>
                        </li>
                        {/* Button for 'Transaction History' section */}
                        <li>
                            <button
                                onClick={() => setActiveSection('LendingBooks')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'LendingBooks'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                Lending Books
                            </button>
                        </li>
                        {/* Add other admin navigation items here if needed */}
                    </ul>
                </nav>

                {/* Content Area for the Active Section */}
                <div>
                    {/* Conditionally render the component based on the activeSection state */}
                    {activeSection === 'InsertBooks' && < InsertBooks/> }
                    {activeSection === 'PendingRequests' && < PendingRequests/>}
                    {activeSection === 'LendingBooks' && <LendingBooks/>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;