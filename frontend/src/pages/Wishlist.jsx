// src/pages/MyWishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "@/utils/ApiCall"; // Adjust path as necessary
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as necessary
import { toast } from 'react-toastify'; // For notifications
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

const MyWishlistPage = () => {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth(); // Get token and isAuthenticated from AuthContext

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall('/api/wish', {}, 'GET', token);
            setWishlist(response);
            console.log("Wishlist Data:", response);
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
            setError("Failed to load your wishlist. Please try again.");
            toast.error("Failed to load your wishlist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch wishlist if authenticated and token is available
        if (isAuthenticated && token) {
            fetchWishlist();
        } else if (!isAuthenticated) {
            // If not authenticated, stop loading and clear any previous data
            setLoading(false);
            setWishlist([]);
            setError(null); // Clear any old errors if user logs out
        }
    }, [token, isAuthenticated]); // Dependency array includes isAuthenticated

    const handleBookClick = (bookId) => {
        navigate(`/book-details?id=${bookId}`);
    };

    // --- Conditional Rendering for Authentication Status ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        Please log in to view your wishlist.
                    </p>
                    <Button
                        onClick={() => navigate('/login')} // Assuming your login route is '/login'
                        className="bg-green-600 text-white hover:bg-green-700 w-full"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // --- Existing Loading and Error States ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-gray-700">Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4 pb-10 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
                </div>

                {/* Wishlist Items */}
                <div className="space-y-4">
                    {wishlist.length === 0 ? (
                        <p className="text-gray-600">Your wishlist is empty.</p>
                    ) : (
                        wishlist.map((book) => (
                            <div
                                key={book.wish_id}
                                className="flex p-4 bg-gray-50 rounded-lg shadow-sm w-full cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleBookClick(book.book_id)}
                            >
                                <img
                                    src={book.image_url || '/images/default_book_cover.jpg'}
                                    alt={book.title}
                                    className="w-16 h-20 object-cover rounded mr-4 flex-shrink-0"
                                />
                                <div className="flex-grow flex flex-col justify-center">
                                    <h3 className="font-medium text-gray-900">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{book.author}</p>
                                </div>
                                {/* Optional: Add a small arrow or icon to indicate clickable */}
                                <div className="ml-auto flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyWishlistPage;