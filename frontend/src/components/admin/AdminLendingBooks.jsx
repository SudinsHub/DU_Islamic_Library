import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { buttonGreen } from "@/utils/colors"; // Assuming you have this color
import { format } from 'date-fns'; // Only need format, not addDays anymore

// Icon for info button (you might replace this with an actual SVG icon library if you have one)
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const LendingBooks = () => {
    const { token } = useAuth();
    const [currentLendings, setCurrentLendings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for showing contact card
    const [hoveredLendingId, setHoveredLendingId] = useState(null);
    const contactCardRef = useRef(null); // Ref for click outside logic

    // New states for hall selection
    const [halls, setHalls] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState(''); // Empty string for 'All Halls'

    // --- Fetch Halls ---
    useEffect(() => {
        const fetchHalls = async () => {
            try {
                const response = await apiCall('/api/halls', {}, 'GET');
                setHalls(response);
            } catch (err) {
                console.error('Network error fetching halls:', err);
                setError(prev => prev ? prev + '\nNetwork error fetching halls.' : 'Network error fetching halls.');
            }
        };
        fetchHalls();
    }, [token]);

    const fetchCurrentLendings = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            let apiUrl = `/api/lendings?status=pending`;
            if (selectedHallId) {
                apiUrl += `&hall_id=${selectedHallId}`; // Add hall_id to query params if selected
            }
            const response = await apiCall(apiUrl, {}, 'GET', token);
            if (response.success) {
                // Filter for 'pending' status as per requirement, if API doesn't filter directly
                const pendingLendings = response.data.filter(lending => lending.status === 'pending');
                setCurrentLendings(pendingLendings);
            } else {
                setError(response.message || 'Failed to fetch current lendings.');
            }
        } catch (err) {
            console.error('Network error fetching current lendings:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedHallId]); // Re-run when selectedHallId changes

    useEffect(() => {
        fetchCurrentLendings();
    }, [fetchCurrentLendings]);

    const handleReturnBook = async (lendingId) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await apiCall(
                `/api/lendings/return`,
                { lending_id: lendingId },
                'PATCH',
                token
            );
            if (response.success) {
                setSuccessMessage('Book marked as returned successfully!');
                fetchCurrentLendings(); // Refresh the list
            } else {
                setError(response.message || 'Failed to mark book as returned.');
            }
        } catch (err) {
            console.error('Network error returning book:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle click outside for contact card on mobile (or if button is clicked)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contactCardRef.current && !contactCardRef.current.contains(event.target)) {
                 // Ensure the click isn't on the info button itself
                 if (!event.target.closest('[aria-label="Show borrower contact details"]')) {
                    setHoveredLendingId(null);
                }
            }
        };

        if (hoveredLendingId) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside); // For mobile taps
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [hoveredLendingId]);


    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Lending Books</h2>

            {/* Hall Selection Dropdown */}
            <div className="mb-6 flex items-center space-x-3">
                <label htmlFor="hall-select" className="text-gray-700 font-medium">Filter by Hall:</label>
                <select
                    id="hall-select"
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
                    className="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                >
                    <option value="">All Halls</option> {/* Option to view all lendings */}
                    {halls.map((hall) => (
                        <option key={hall.hall_id} value={hall.hall_id}>
                            {hall.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p className="text-gray-600">Loading current lendings...</p>}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

            {!loading && currentLendings.length === 0 && !error && (
                <p className="text-gray-600">No books currently lent for the selected hall.</p>
            )}

            <div className="space-y-4">
                {currentLendings.map((lending) => (
                    <div key={lending.lending_id} className="border border-gray-200 rounded-md p-4 bg-gray-50 shadow-sm relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                            <p><span className="font-semibold">Book Title:</span> {lending.request?.book?.title}</p>
                            <p className="flex items-center space-x-2">
                                <span className="font-semibold">Borrowed By:</span>
                                <span>{lending.request?.reader?.name}</span>
                                <button
                                    type="button"
                                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                    onMouseEnter={() => setHoveredLendingId(lending.lending_id)}
                                    onMouseLeave={() => setHoveredLendingId(null)}
                                    onClick={() => setHoveredLendingId(hoveredLendingId === lending.lending_id ? null : lending.lending_id)} // Toggle on click for mobile
                                    aria-label="Show borrower contact details"
                                >
                                    <InfoIcon />
                                </button>
                            </p>
                            <p><span className="font-semibold">Return Date:</span> {format(new Date(lending.return_date), 'MMM dd, yyyy')}</p>
                            <p><span className="font-semibold">Issue Date:</span> {format(new Date(lending.issue_date), 'MMM dd, yyyy')}</p>

                        </div>

                        {/* Contact Hover Card */}
                        {hoveredLendingId === lending.lending_id && (
                            <div
                                ref={contactCardRef}
                                className="absolute z-20 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm right-2 top-2 mt-8 md:mt-0 md:right-auto md:left-1/2 md:-translate-x-1/2"
                            >
                                <p className="font-semibold text-gray-800 mb-1">Borrower Contact Info:</p>
                                <p><span className="font-medium">Email:</span> {lending.request?.reader?.email || 'N/A'}</p>
                                <p><span className="font-medium">Phone:</span> {lending.request?.reader?.contact || 'N/A'}</p>
                                <p><span className="font-medium">Session:</span> {lending.request?.reader?.session || 'N/A'}</p>
                                <p><span className="font-medium">Gender:</span> {lending.request?.reader?.gender || 'N/A'}</p>
                            </div>
                        )}

                        <div className="mt-4">
                            <Button
                                onClick={() => handleReturnBook(lending.lending_id)}
                                style={{ backgroundColor: buttonGreen }}
                                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                disabled={loading}
                            >
                                {loading ? 'Returning...' : 'Return Book'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LendingBooks;