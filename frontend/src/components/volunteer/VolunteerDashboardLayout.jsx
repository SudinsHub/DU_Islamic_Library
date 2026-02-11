import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiCall } from '@/utils/ApiCall';
import { buttonGreen } from '@/utils/colors';
import { toast } from 'react-toastify';
import DashboardSidebar from '@/components/DashboardSidebar';
import InsertBookForm from '@/components/volunteer/InsertBookForm';
import PendingRequests from '@/components/volunteer/PendingRequests';
import CurrentLendings from '@/components/volunteer/CurrentLendings';
import VolBookIndex from '@/components/volunteer/VolBookIndex';
import Navbar from '@/components/Navbar';

const VolunteerDashboardLayout = () => {
    const { section } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, userType, user, token } = useAuth();
    const [isVolunteerAvailable, setIsVolunteerAvailable] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    const [errorAvailability, setErrorAvailability] = useState(null);
    const [volunteerName, setVolunteerName] = useState('Volunteer');

    // Redirect if not authenticated or not a volunteer
    useEffect(() => {
        if (isAuthenticated && userType !== 'volunteer') {
            navigate('/');
        }
        if (!isAuthenticated) {
            navigate('/user/volunteer');
        }
    }, [isAuthenticated, userType, navigate]);

    // Map section to component
    const validSections = {
        'insert-book': <InsertBookForm />,
        'pending-requests': <PendingRequests />,
        'current-lendings': <CurrentLendings />,
        'book-index': <VolBookIndex />,
    };

    const currentSection = validSections[section] || validSections['insert-book'];
    const currentSectionKey = Object.keys(validSections).includes(section) ? section : 'insert-book';

    // Fetch volunteer status
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
        if (token) {
            fetchVolunteerStatus();
        }
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
        <>
        <Navbar/>
        <div className="flex min-h-screen bg-gray-100  pt-20">
            {/* Sidebar - only visible on large screens */}
            <DashboardSidebar userType="volunteer" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header
                <div className="bg-white shadow-sm p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome, {volunteerName}!
                        </h1>
                        <div className="flex items-center gap-4">
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
                                        <div
                                            style={{ backgroundColor: isVolunteerAvailable ? buttonGreen : '#E5E7EB' }}
                                            className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
                                        ></div>
                                    </label>
                                </div>
                            )}
                            {errorAvailability && <p className="text-red-500 text-sm">{errorAvailability}</p>}
                        </div>
                    </div>
                </div> */}

                {/* Content Area */}
                {/* <div className="flex-1 p-4 sm:p-6 lg:p-8"> */}
                    {/* <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"> */}
                        {currentSection}
                    {/* </div> */}
                {/* </div> */}
            </div>
        </div>
        </>
    );
};

export default VolunteerDashboardLayout;
