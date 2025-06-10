import React, { useState, useEffect } from 'react';
import InsertBookForm from '@/components/volunteer/InsertBookForm';
import PendingRequests from '@/components/volunteer/PendingRequests';
import CurrentLendings from '@/components/volunteer/CurrentLendings';
import { apiCall } from '@/utils/ApiCall'; // Assuming your API utility
import { buttonGreen } from "@/utils/colors"; // Your custom green color
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { toast } from 'react-toastify';
const VolunteerDashboard = () => {
    const [activeSection, setActiveSection] = useState('insertBook'); // 'insertBook', 'pendingRequests', 'currentLendings'
    const [isVolunteerAvailable, setIsVolunteerAvailable] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    const [errorAvailability, setErrorAvailability] = useState(null);
    const [volunteerName, setVolunteerName] = useState('Volunteer'); // Placeholder
    const {token} = useAuth(); 
    // Fetch initial volunteer availability and name
    useEffect(() => {
        const fetchVolunteerStatus = async () => {
            setLoadingAvailability(true);
            try {
                const response = await apiCall('/api/user', {}, 'GET', token);
                console.log('Volunteer status fetched:', response);
                setIsVolunteerAvailable(response.isAvailable);
                setVolunteerName(response.name || 'Volunteer');
            } catch (error) {
                console.error('Error fetching volunteer status:', error);
                setErrorAvailability('Failed to fetch volunteer status.');
            } finally {
                setLoadingAvailability(false);
            }
        };
        fetchVolunteerStatus();
    }, [token]);

    const handleToggleAvailability = async () => {
        setLoadingAvailability(true);
        setErrorAvailability(null);
        try {
            const response = await apiCall('/api/vol/toggle-availability', {}, 'POST', token); 
            setIsVolunteerAvailable(response.isAvailable); 
            toast.success('Availability updated successfully!');
        } catch (error) {
            console.error('Error toggling availability:', error);
            setErrorAvailability('Network error toggling availability.');
        } finally {
            setLoadingAvailability(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                        Welcome, {volunteerName}!
                    </h1>
                    <div className="flex items-center space-x-4">
                        {loadingAvailability ? (
                            <span className="text-gray-500">Loading...</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-700 text-sm font-medium">Available:</span>
                                <label className="inline-flex relative items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isVolunteerAvailable}
                                        onChange={handleToggleAvailability}
                                        disabled={loadingAvailability}
                                    />
                                    <div style={{ backgroundColor: isVolunteerAvailable ? buttonGreen : '#E5E7EB' }}
                                         className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
                                </label>
                            </div>
                        )}
                        {errorAvailability && <p className="text-red-500 text-sm">{errorAvailability}</p>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mb-8 overflow-x-auto">
                    <ul className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start gap-2 sm:gap-4 text-center text-sm sm:text-base font-medium border-b border-gray-200">
                        <li>
                            <button
                                onClick={() => setActiveSection('insertBook')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'insertBook'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500' // Use a green accent for active
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                Insert Book
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveSection('pendingRequests')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'pendingRequests'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                Pending Requests
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveSection('currentLendings')}
                                className={`py-3 px-4 rounded-t-lg transition-colors duration-200 ${
                                    activeSection === 'currentLendings'
                                        ? 'bg-gray-50 text-gray-900 border-b-2 border-green-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                Current Lendings
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Section Content */}
                <div>
                    {activeSection === 'insertBook' && <InsertBookForm />}
                    {activeSection === 'pendingRequests' && <PendingRequests />}
                    {activeSection === 'currentLendings' && <CurrentLendings />}
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;