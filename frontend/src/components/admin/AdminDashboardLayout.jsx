import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import DashboardSidebar from '@/components/DashboardSidebar';
import InsertBooks from '@/components/admin/AdminInsertBook';
import PendingRequests from '@/components/admin/AdminPendingRequests';
import LendingBooks from '@/components/admin/AdminLendingBooks';
import VerifyVolunteers from '@/components/admin/VerifyVolunteers';
import AdminReadersPage from '@/components/admin/AdminReadersPage';
import VolunteersPage from '@/components/admin/AdminVolunteersPage';
import BookIndex from '@/components/admin/BookIndex';
import EntityManagement from '@/components/admin/EntityManagement';
import RegistrationForm from '@/components/auth/RegistrationForm';
import Navbar from '@/components/Navbar';

const AdminDashboardLayout = () => {
    const { section } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, userType, user } = useAuth();
    const [adminName, setAdminName] = useState('Admin');

    // Redirect if not authenticated or not an admin
    useEffect(() => {
        if (isAuthenticated && userType !== 'admin') {
            navigate('/');
        }
        if (!isAuthenticated) {
            navigate('/user/admin');
        }
    }, [isAuthenticated, userType, navigate]);

    // Set admin name from user
    useEffect(() => {
        if (user && user.name) {
            setAdminName(user.name);
        }
    }, [user]);

    // Map section to component
    const validSections = {
        'verify-volunteers': <VerifyVolunteers />,
        'insert-books': <InsertBooks />,
        'pending-requests': <PendingRequests />,
        'pending-borrows': <LendingBooks />,
        'readers': <AdminReadersPage />,
        'volunteers': <VolunteersPage />,
        'book-index': <BookIndex />,
        'entity-management': <EntityManagement />,
        'admin-management': <RegistrationForm userType="admin" />,
    };

    const currentSection = validSections[section] || validSections['verify-volunteers'];
    const currentSectionKey = Object.keys(validSections).includes(section) ? section : 'verify-volunteers';

    return (
        <>
        <Navbar/>
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar - only visible on large screens */}
            <DashboardSidebar userType="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white shadow-sm p-4 sm:p-6 lg:p-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome, {adminName}!
                    </h1>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        {currentSection}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AdminDashboardLayout;
