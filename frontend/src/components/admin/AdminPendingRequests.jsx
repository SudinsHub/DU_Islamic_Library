// src/pages/Admin/PendingBookRequests.jsx (or wherever your file is)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components
import { Loader2 } from 'lucide-react'; // Import Loader icon
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext';
import { buttonGreen } from "@/utils/colors"; // Assuming you have this color
import { format, addDays, startOfDay, endOfDay, parseISO } from 'date-fns'; // For date manipulation and formatting

// Import for Date Picker
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles for react-day-picker
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // For date picker popover

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

    // Date Picker for Fulfill action
    const [showDatePickerFor, setShowDatePickerFor] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    // State for showing contact card
    const [hoveredRequestId, setHoveredRequestId] = useState(null);
    const contactCardRef = useRef(null); // Ref for click outside logic

    // New states for hall selection
    const [halls, setHalls] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState(''); // Empty string for 'All Halls'

    // New states for filtering and sorting
    const [filterStatus, setFilterStatus] = useState('pending'); // Default to pending
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' for request_date
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [bookTitleFilter, setBookTitleFilter] = useState('');

    const [isFiltering, setIsFiltering] = useState(false); // To track if any filter is active

    // Debounce for book title filter
    const debounceTimeout = useRef(null);

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


    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const params = new URLSearchParams();
            if (filterStatus) {
                params.append('status', filterStatus);
            }
            if (selectedHallId) {
                params.append('hall_id', selectedHallId);
            }
            if (sortOrder) {
                params.append('sort_by', 'request_date');
                params.append('sort_order', sortOrder);
            }
            if (startDateFilter) {
                params.append('start_date', format(startDateFilter, 'yyyy-MM-dd'));
            }
            if (endDateFilter) {
                params.append('end_date', format(endDateFilter, 'yyyy-MM-dd'));
            }
            if (bookTitleFilter) {
                params.append('book_title', bookTitleFilter);
            }

            const apiUrl = `/api/request?${params.toString()}`;
            const response = await apiCall(apiUrl, {}, 'GET', token);

            if (response.success) {
                setPendingRequests(response.data);
            } else {
                setError(response.message || 'Failed to fetch requests.');
            }
        } catch (err) {
            console.error('Network error fetching requests:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedHallId, filterStatus, sortOrder, startDateFilter, endDateFilter, bookTitleFilter]); // Dependencies for useCallback

    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [token, fetchRequests]); // Re-fetch when dependencies change

    // Effect to determine if any filter is active
    useEffect(() => {
        const active = selectedHallId !== '' ||
                       filterStatus !== 'pending' || // 'pending' is default
                       sortOrder !== 'desc' || // 'desc' is default
                       startDateFilter !== null ||
                       endDateFilter !== null ||
                       bookTitleFilter !== '';
        setIsFiltering(active);
    }, [selectedHallId, filterStatus, sortOrder, startDateFilter, endDateFilter, bookTitleFilter]);


    const handleFulfillRequest = async (reqId) => {
        if (!returnDate) {
            setError("Please select a return date.");
            return;
        }

        setLoading(true); // This loading state applies to the whole component
        setError(null);
        setSuccessMessage(null);
        try {
            const formattedReturnDate = format(returnDate, 'yyyy-MM-dd');
            const response = await apiCall(
                `/api/request/fulfill`,
                { return_date: formattedReturnDate, req_id: reqId },
                'PATCH',
                token
            );
            if (response.success) {
                setSuccessMessage('Book request fulfilled successfully!');
                fetchRequests(); // Refresh requests
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
        if (!window.confirm("Are you sure you want to cancel this request?")) {
            return;
        }
        setLoading(true); // This loading state applies to the whole component
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await apiCall(`/api/request/cancel`, { req_id: reqId }, 'PATCH', token);
            if (response.success) {
                setSuccessMessage('Book request cancelled successfully!');
                fetchRequests(); // Refresh requests
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


    const handleBookTitleFilterChange = (e) => {
        const value = e.target.value;
        setBookTitleFilter(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            // No explicit fetchRequests call here, as it's a dependency of useEffect
            // which will trigger when bookTitleFilter changes.
        }, 500); // Debounce for 500ms
    };

    const clearFilters = () => {
        setSelectedHallId('');
        setFilterStatus('pending');
        setSortOrder('desc');
        setStartDateFilter(null);
        setEndDateFilter(null);
        setBookTitleFilter('');
        // fetchRequests will be called via useEffect due to state changes
    };


    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Requests</h2>

            {/* Filter and Sort Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {/* Hall Selection Dropdown */}
                <div>
                    <label htmlFor="hall-select" className="block text-gray-700 font-medium text-sm mb-1">Filter by Hall:</label>
                    <select
                        id="hall-select"
                        value={selectedHallId}
                        onChange={(e) => setSelectedHallId(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="">All Halls</option> {/* Option to view all requests */}
                        {halls.map((hall) => (
                            <option key={hall.hall_id} value={hall.hall_id}>
                                {hall.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label htmlFor="status-filter" className="block text-gray-700 font-medium text-sm mb-1">Filter by Status:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="pending">Pending</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="">All Statuses</option>
                    </select>
                </div>

                {/* Sort by Date */}
                <div>
                    <label htmlFor="sort-order" className="block text-gray-700 font-medium text-sm mb-1">Sort by Request Date:</label>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                {/* Book Title Filter */}
                <div>
                    <label htmlFor="book-title-filter" className="block text-gray-700 font-medium text-sm mb-1">Filter by Book Title:</label>
                    <input
                        type="text"
                        id="book-title-filter"
                        value={bookTitleFilter}
                        onChange={handleBookTitleFilterChange}
                        placeholder="e.g., The Lord of the Rings"
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    />
                </div>

                {/* Date Range Filter - Start Date */}
                <div>
                    <label htmlFor="start-date-filter" className="block text-gray-700 font-medium text-sm mb-1">From Date:</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={"w-full justify-start text-left font-normal"}
                            >
                                {startDateFilter ? format(startDateFilter, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <DayPicker
                                mode="single"
                                selected={startDateFilter}
                                onSelect={setStartDateFilter}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Date Range Filter - End Date */}
                <div>
                    <label htmlFor="end-date-filter" className="block text-gray-700 font-medium text-sm mb-1">To Date:</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={"w-full justify-start text-left font-normal"}
                            >
                                {endDateFilter ? format(endDateFilter, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <DayPicker
                                mode="single"
                                selected={endDateFilter}
                                onSelect={setEndDateFilter}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {isFiltering && (
                <div className="mb-6">
                    <Button onClick={clearFilters} variant="secondary">
                        Clear All Filters
                    </Button>
                </div>
            )}


            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="ml-2 text-gray-600">Loading requests...</p>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert className="mb-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            {!loading && pendingRequests.length === 0 && !error && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                    <AlertTitle>No Requests Found</AlertTitle>
                    <AlertDescription>No book requests match your current filters.</AlertDescription>
                </Alert>
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
                            <p><span className="font-semibold">Requested Date:</span> {format(parseISO(request.request_date), 'MMM dd, yyyy')}</p>
                             <p><span className="font-semibold">Current Status:</span> {request.status}</p> {/* Display current status */}
                        </div>

                        {/* Contact Hover Card */}
                        {hoveredRequestId === request.req_id && (
                            <div
                                ref={contactCardRef}
                                className="absolute z-20 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm right-2 top-2 mt-8 md:mt-0 md:right-auto md:left-1/2 md:-translate-x-1/2"
                            >
                                <p className="font-semibold text-gray-800 mb-1">Reader Contact Info:</p>
                                <p><span className="font-medium">Email:</span> {request.reader?.email || 'N/A'}</p>
                                <p><span className="font-medium">Phone:</span> {request.reader?.contact || 'N/A'}</p>
                                <p><span className="font-medium">Session:</span> {request.reader?.session || 'N/A'}</p>
                                <p><span className="font-medium">Gender:</span> {request.reader?.gender || 'N/A'}</p>
                            </div>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                            {request.status === 'pending' && ( // Only show fulfill/cancel buttons for pending requests
                                <>
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
                                                    {loading ? ( // Use loading spinner for overall component loading
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Confirm Fulfill'
                                                    )}
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
                                </>
                            )}
                            {request.status !== 'pending' && (
                                <p className="text-gray-500 italic">This request is {request.status}.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingBookRequests;