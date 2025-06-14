import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { buttonGreen } from '../utils/colors'; // Assuming this path is correct
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserInfoCard, setShowUserInfoCard] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const { isAuthenticated, user, userType, logout } = useAuth();
    const navigate = useNavigate();

    // Refs for click outside functionality
    const userInfoCardRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const userIconRef = useRef(null); // Ref for the user icon button
    const menuButtonRef = useRef(null); // Ref for the mobile menu button

    useEffect(() => {
        function handleClickOutside(event) {
            // Close user info card if clicked outside AND not on the user icon itself
            if (userInfoCardRef.current && !userInfoCardRef.current.contains(event.target) &&
                userIconRef.current && !userIconRef.current.contains(event.target)) {
                setShowUserInfoCard(false);
            }
            // Close mobile menu if clicked outside AND not on the menu button itself
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/browse-books?search=${searchTerm}`);
    };

    const handleBrowseBooks = (e) => {
        e.preventDefault();
        navigate(`/browse-books`);
    };

    const handleLoginButton = (e) => {
        e.preventDefault();
        navigate(`/user/reader`);
    };

    const handleUserIconClick = () => {
        setShowUserInfoCard(!showUserInfoCard);
        setShowMobileMenu(false); // Close mobile menu if user card is opened
    };

    const handleMobileMenuClick = () => {
        setShowMobileMenu(!showMobileMenu);
        setShowUserInfoCard(false); // Close user card if mobile menu is opened
    };

    const handleLogout = () => {
        logout();
        setShowUserInfoCard(false);
        setShowMobileMenu(false); // Close menu on logout
        navigate('/browse-books');
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full bg-white rounded-lg p-4 shadow-md">
            {!isAuthenticated ? (
                // Logged out navbar
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section: Logo + Search Bar */}
                    <div className="flex items-center flex-grow"> {/* flex-grow here to push search bar */}
                        {/* Logo - Controlled size */}
                        <div className="h-8 w-8 md:h-11 md:w-11 mr-2 flex-shrink-0"> {/* Adjusted size for responsiveness */}
                            {/* Your SVG Logo */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84" fill="none">
                                <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
                                <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
                                <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
                                <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
                                <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
                            </svg>
                        </div>
                        {/* Title - responsive, hidden on small screens */}
                        <span className="font-bold text-xl md:text-2xl text-[#008F5E] hidden md:block mx-4">Dhaka University Islamic Library</span>

                        {/* Search Bar - responsive width and placeholder text size */}
                        <div className="relative flex-grow md:flex-grow-0 md:w-96"> {/* Increased width on desktop */}
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base" // Responsive text size
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Section: Browse Books & Log In */}
                    <div className="flex items-center gap-4 ml-auto flex-shrink-0">
                        <a href="/browse-books" className={`text-gray-800 font-medium hover:text-[${buttonGreen}] text-sm md:text-lg`}>Browse books</a> {/* Responsive text size */}
                        <button
                            onClick={handleLoginButton}
                            className={`px-5 py-2 text-white font-medium rounded-lg bg-[${buttonGreen}] hover:opacity-90 transition-opacity text-sm md:text-lg`} 
                        >
                            Log In
                        </button>
                    </div>
                </div>
            ) : (
                // Logged in navbar
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section: Logo + Search Bar */}
                    <div className="flex items-center flex-grow"> {/* flex-grow here to push search bar */}
                        {/* Logo - Controlled size */}
                        <div className="h-8 w-8 md:h-10 md:w-10 mr-2 flex-shrink-0"> {/* Adjusted size for responsiveness */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84" fill="none">
                                <path d="M37.833 0.333328C37.833 4.9357 34.1021 8.66666 29.4997 8.66666C21.7337 8.66666 15.2083 13.9782 13.3581 21.1667H0.333008V29.5H21.1663V25.3333C21.1663 20.731 24.8973 17 29.4997 17C34.4776 17 38.9457 14.8177 41.9997 11.3576C45.0536 14.8177 49.5218 17 54.4997 17C59.1021 17 62.833 20.731 62.833 25.3333V29.5H75.333V50.3333H83.6664V21.1667H70.6413C68.7911 13.9782 62.2657 8.66666 54.4997 8.66666C49.8973 8.66666 46.1663 4.9357 46.1663 0.333328H37.833Z" fill="#008F5E"/>
                                <path d="M29.4997 75.3333C34.1021 75.3333 37.833 79.0643 37.833 83.6667H46.1663C46.1663 79.0643 49.8973 75.3333 54.4997 75.3333H83.6664V67H54.4997C49.5218 67 45.0536 69.1823 41.9997 72.6424C38.9457 69.1823 34.4776 67 29.4997 67L0.333008 67V75.3333H29.4997Z" fill="#008F5E"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.1663 33.6667H0.333008V62.8333H16.1663C18.9278 62.8333 21.1663 60.5948 21.1663 57.8333V38.6667C21.1663 35.9052 18.9278 33.6667 16.1663 33.6667ZM8.66634 54.5V42H12.833V54.5H8.66634Z" fill="#008F5E"/>
                                <path d="M33.6663 33.6667V54.5H37.833V33.6667H46.1663V57.8333C46.1663 60.5948 43.9278 62.8333 41.1663 62.8333H30.333C27.5716 62.8333 25.333 60.5948 25.333 57.8333V33.6667H33.6663Z" fill="#008F5E"/>
                                <path d="M58.6663 62.8333L58.6664 33.6667H50.333V62.8333H58.6663Z" fill="#008F5E"/>
                                <path d="M71.1663 33.6667V54.5H83.6664V62.8333H67.833C65.0716 62.8333 62.833 60.5948 62.833 57.8333V33.6667H71.1663Z" fill="#008F5E"/>
                            </svg>
                        </div>
                        {/* Title - responsive, hidden on small screens */}
                        <span className="font-bold text-xl md:text-2xl text-[#008F5E] hidden md:block mx-4">Dhaka University Islamic Library</span>

                        {/* Search Bar - responsive width and placeholder text size */}
                        <div className="relative flex-grow md:flex-grow-0 md:w-96"> {/* Increased width on desktop */}
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base" // Responsive text size
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Section - Logged in: Browse Books, Mobile Menu, User Icon */}
                    <div className="flex items-center gap-4 ml-auto flex-shrink-0">
                        {/* Browse books - always visible */}
                        <button
                            className={`px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-[${buttonGreen}] transition-colors text-sm md:text-base`} // Responsive text size
                            onClick={handleBrowseBooks}
                        >
                            Browse books
                        </button>

                        {/* Mobile Menu Button (visible on small screens) */}
                        <div className="relative md:hidden">
                            <button
                                ref={menuButtonRef}
                                className="p-2 text-gray-600 hover:text-gray-800"
                                onClick={handleMobileMenuClick}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            {showMobileMenu && (
                                <div
                                    ref={mobileMenuRef}
                                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2"
                                >
                                    {userType === 'reader' && ( // Only show these for 'reader'
                                        <>
                                            <a href="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">Dashboard</a>
                                            <a href="/wishlist" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">Wishlist</a>
                                            <a href="/my-reads" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">My Reads</a>
                                            <hr className="my-1 border-gray-200" />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop Links (visible on md screens and up) */}
                        <div className="hidden md:flex items-center gap-4">
                            {userType === 'reader' && ( // Only show these for 'reader'
                                <>
                                    <a href="/dashboard" className={`text-gray-800 font-medium hover:text-[${buttonGreen}] text-sm md:text-base`}>Dashboard</a> {/* Responsive text size */}
                                    <a href="/wishlist" className={`text-gray-800 font-medium hover:text-[${buttonGreen}] text-sm md:text-base`}>Wishlist</a> {/* Responsive text size */}
                                    <a href="/my-reads" className={`text-gray-800 font-medium hover:text-[${buttonGreen}] text-sm md:text-base`}>My Reads</a> {/* Responsive text size */}
                                </>
                            )}
                        </div>

                        {/* User Icon and Info Card (positioned consistently for both mobile and desktop) */}
                        <div className="relative"> {/* This relative parent ensures correct absolute positioning of the card */}
                            <button
                                ref={userIconRef}
                                className={`p-2 text-gray-600 hover:text-[${buttonGreen}]`}
                                onClick={handleUserIconClick}
                            >
                                <User className="h-6 w-6" />
                            </button>

                            {showUserInfoCard && user && (
                                <div
                                    ref={userInfoCardRef}
                                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-4 text-gray-800"
                                >
                                    <p className="font-bold text-base">Assalamu Alaikum,</p>
                                    <p className="font-bold text-lg mb-2 text-wrap"> {user.name || 'User'}!</p>
                                    <p className="text-sm">Email: {user.email}</p>
                                    {user.contact && <p className="text-sm">Contact: {user.contact}</p>}
                                    {user.user_type && <p className="text-sm">Role: {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}</p>}

                                    <button
                                        onClick={handleLogout}
                                        className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-sm`}
                                    >
                                        <LogOut className="h-5 w-5" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;