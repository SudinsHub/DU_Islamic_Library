//DashboardSidebar.jsx
import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { buttonGreen } from '@/utils/colors';

const DashboardSidebar = ({ userType }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { section } = useParams();

    // Define menu items for each user type
    const getMenuItems = () => {
        if (userType === 'volunteer') {
            return [
                { id: 'insert-book', label: 'Insert Book', path: '/user/volunteer/insert-book' },
                { id: 'pending-requests', label: 'Pending Requests', path: '/user/volunteer/pending-requests' },
                { id: 'current-lendings', label: 'Current Lendings', path: '/user/volunteer/current-lendings' },
                { id: 'book-index', label: 'Book Index', path: '/user/volunteer/book-index' },
            ];
        } else if (userType === 'admin') {
            return [
                { id: 'verify-volunteers', label: 'Verify Volunteers', path: '/user/admin/verify-volunteers' },
                { id: 'insert-books', label: 'Insert Books', path: '/user/admin/insert-books' },
                { id: 'pending-requests', label: 'Pending Requests', path: '/user/admin/pending-requests' },
                { id: 'pending-borrows', label: 'Pending Borrows', path: '/user/admin/pending-borrows' },
                { id: 'readers', label: 'Readers', path: '/user/admin/readers' },
                { id: 'volunteers', label: 'Volunteers', path: '/user/admin/volunteers' },
                { id: 'book-index', label: 'Book Index', path: '/user/admin/book-index' },
                { id: 'entity-management', label: 'Entity Management', path: '/user/admin/entity-management' },
                { id: 'admin-management', label: 'Admin Management', path: '/user/admin/admin-management' },
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();
    const currentSection = section || (userType === 'volunteer' ? 'insert-book' : 'verify-volunteers');

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <aside className="hidden md:flex md:w-64 bg-gray-900 text-white flex-col h-screen sticky">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-700">
                <p className="text-sm text-gray-400 mt-1">
                    {userType === 'volunteer' ? 'Volunteer Panel' : 'Administration Panel'}
                </p>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => handleMenuClick(item.path)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm ${
                                    currentSection === item.id
                                        ? `bg-[${buttonGreen}] text-white shadow-md`
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                                style={
                                    currentSection === item.id
                                        ? { backgroundColor: buttonGreen ? buttonGreen : '#008F5E' }
                                        : {}
                                }
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
                <p>Dhaka University</p>
                <p>Islamic Library</p>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
