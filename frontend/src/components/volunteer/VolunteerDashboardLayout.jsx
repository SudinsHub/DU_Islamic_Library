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
import Footer from '../Footer';

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
        <div className="flex min-h-screen bg-gray-100 pt-20">
            {/* Sidebar - only visible on large screens */}
            <DashboardSidebar userType="volunteer" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {currentSection}
            </div>


        </div>
        <Footer/>
        </>
    );
};

export default VolunteerDashboardLayout;
