import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { buttonGreen } from "@/utils/colors"; // Assuming you have this color
import { format, addDays } from 'date-fns'; // For date manipulation and formatting

// Import for Date Picker
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles for react-day-picker

// Icon for info button (you might replace this with an actual SVG icon library if you have one)
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const PendingBookRequests = () => {
    const { token } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [showDatePickerFor, setShowDatePickerFor] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    // State for showing contact card
    const [hoveredRequestId, setHoveredRequestId] = useState(null);
    const contactCardRef = useRef(null); // Ref for click outside logic

    // New states for hall selection
    const [halls, setHalls] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState(''); // Empty string for 'All Halls'

    // Helper to calculate default return date (7 days from today)
    const getDefaultReturnDate = () => {
        return addDays(new Date(), 7);
    };

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


    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            let apiUrl = '/api/request?status=pending';
            if (selectedHallId) {
                apiUrl += `&hall_id=${selectedHallId}`; // Add hall_id to query params if selected
            }
            const response = await apiCall(apiUrl, {}, 'GET', token);
            if (response.success) {
                setPendingRequests(response.data);
            } else {
                setError(response.message || 'Failed to fetch pending requests.');
            }
        } catch (err) {
            console.error('Network error fetching pending requests:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedHallId]); // Re-run when selectedHallId changes

    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);

    const handleFulfillRequest = async (reqId) => {
        if (!returnDate) {
            setError("Please select a return date.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const formattedReturnDate = format(returnDate, 'yyyy-MM-dd');
            const response = await apiCall(
                `/api/request/fulfill`,
                { return_date: formattedReturnDate,
                  req_id: reqId
                 },
                'PATCH',
                token
            );
            if (response.success) {
                setSuccessMessage('Book request fulfilled successfully!');
                fetchPendingRequests(); // Refresh requests
                setShowDatePickerFor(null);
                setReturnDate(null);
            } else {
                setError(response.message || 'Failed to fulfill request.');
            }
        } catch (err) {
            console.error('Network error fulfilling request:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (reqId) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await apiCall(`/api/request/cancel`, {req_id : reqId}, 'PATCH', token);
            if (response.success) {
                setSuccessMessage('Book request cancelled successfully!');
                fetchPendingRequests(); // Refresh requests
            } else {
                setError(response.message || 'Failed to cancel request.');
            }
        } catch (err) {
            console.error('Network error cancelling request:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDatePicker = (reqId) => {
        setShowDatePickerFor(showDatePickerFor === reqId ? null : reqId);
        if (showDatePickerFor !== reqId) {
            setReturnDate(getDefaultReturnDate());
        }
    };

    // Handle click outside for contact card on mobile (or if button is clicked)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contactCardRef.current && !contactCardRef.current.contains(event.target)) {
                // Ensure the click isn't on the info button itself
                if (!event.target.closest('[aria-label="Show reader contact details"]')) {
                    setHoveredRequestId(null);
                }
            }
        };

        if (hoveredRequestId) {
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
    }, [hoveredRequestId]);


    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Book Requests</h2>

            {/* Hall Selection Dropdown */}
            <div className="mb-6 flex items-center space-x-3">
                <label htmlFor="hall-select" className="text-gray-700 font-medium">Filter by Hall:</label>
                <select
                    id="hall-select"
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
                    className="mt-1 block w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                >
                    <option value="">All Halls</option> {/* Option to view all requests */}
                    {halls.map((hall) => (
                        <option key={hall.hall_id} value={hall.hall_id}>
                            {hall.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p className="text-gray-600">Loading pending requests...</p>}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

            {!loading && pendingRequests.length === 0 && !error && (
                <p className="text-gray-600">No pending book requests found for the selected hall.</p>
            )}

            <div className="space-y-4">
                {pendingRequests.map((request) => (
                    <div key={request.req_id} className="border border-gray-200 rounded-md p-4 bg-gray-50 shadow-sm relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                            <p><span className="font-semibold">Book Title:</span> {request.book?.title}</p>
                            <p className="flex items-center space-x-2">
                                <span className="font-semibold">Requested By:</span>
                                <span>{request.reader?.name}</span>
                                <button
                                    type="button"
                                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                    onMouseEnter={() => setHoveredRequestId(request.req_id)}
                                    onMouseLeave={() => setHoveredRequestId(null)}
                                    onClick={() => setHoveredRequestId(hoveredRequestId === request.req_id ? null : request.req_id)} // Toggle on click for mobile
                                    aria-label="Show reader contact details"
                                >
                                    <InfoIcon />
                                </button>
                            </p>
                            <p><span className="font-semibold">Requested Date:</span> {format(new Date(request.request_date), 'MMM dd, yyyy')}</p>
                            {/* Reader contact now inside hover card */}
                        </div>

                        {/* Contact Hover Card */}
                        {hoveredRequestId === request.req_id && (
                            <div
                                ref={contactCardRef}
                                className="absolute z-20 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm right-2 top-2 mt-8 md:mt-0 md:right-auto md:left-1/2 md:-translate-x-1/2"
                                // Adjust positioning as needed for different screen sizes.
                                // For simple hover, no need for onClick/onMouseLeave on the card itself
                            >
                                <p className="font-semibold text-gray-800 mb-1">Reader Contact Info:</p>
                                <p><span className="font-medium">Email:</span> {request.reader?.email || 'N/A'}</p>
                                <p><span className="font-medium">Phone:</span> {request.reader?.contact || 'N/A'}</p>
                                <p><span className="font-medium">Session:</span> {request.reader?.session || 'N/A'}</p>
                                <p><span className="font-medium">Gender:</span> {request.reader?.gender || 'N/A'}</p>
                            </div>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                            {showDatePickerFor === request.req_id ? (
                                <div className="flex flex-col items-start space-y-2">
                                    <label htmlFor={`return-date-${request.req_id}`} className="text-sm font-medium text-gray-700">Select Return Date:</label>
                                    <DayPicker
                                        mode="single"
                                        selected={returnDate}
                                        onSelect={setReturnDate}
                                        defaultMonth={getDefaultReturnDate()}
                                        footer={
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {returnDate ? format(returnDate, 'PPP') : 'None'}
                                            </div>
                                        }
                                    />
                                    <div className="flex space-x-2 mt-2">
                                        <Button
                                            onClick={() => handleFulfillRequest(request.req_id)}
                                            style={{ backgroundColor: buttonGreen }}
                                            className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                            disabled={loading}
                                        >
                                            {loading ? 'Fulfilling...' : 'Confirm Fulfill'}
                                        </Button>
                                        <Button
                                            onClick={() => toggleDatePicker(request.req_id)}
                                            variant="outline"
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => toggleDatePicker(request.req_id)}
                                        style={{ backgroundColor: buttonGreen }}
                                        className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                        disabled={loading}
                                    >
                                        Fulfill
                                    </Button>
                                    <Button
                                        onClick={() => handleCancelRequest(request.req_id)}
                                        variant="destructive"
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel Request
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingBookRequests;