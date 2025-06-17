// src/pages/Admin/LendingBooks.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, TriangleAlert } from 'lucide-react'; // Import Loader and Warning icons
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { buttonGreen } from "@/utils/colors"; // Assuming you have this color
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns'; // For date manipulation and formatting

// Import for Date Picker
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles for react-day-picker
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // For date picker popover

// Icon for info button
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

    // New states for filtering and sorting
    const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'returned', 'late', 'all'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' for return_date
    const [dateFilterType, setDateFilterType] = useState('return_date'); // 'issue_date' or 'return_date'
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [bookTitleFilter, setBookTitleFilter] = useState('');

    const [isFiltering, setIsFiltering] = useState(false); // To track if any filter is active

    // Debounce for book title filter
    const debounceTimeout = useRef(null);

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
            const params = new URLSearchParams();
            if (filterStatus && filterStatus !== 'all') { // 'all' is handled client-side
                // If filterStatus is 'late', send 'pending' to backend, then filter client-side
                params.append('status', filterStatus === 'late' ? 'pending' : filterStatus);
            }
            if (selectedHallId) {
                params.append('hall_id', selectedHallId);
            }
            if (sortOrder) {
                params.append('sort_by', 'return_date'); // Always sort by return_date for now
                params.append('sort_order', sortOrder);
            }
            if (startDateFilter) {
                params.append('start_date', format(startDateFilter, 'yyyy-MM-dd'));
            }
            if (endDateFilter) {
                params.append('end_date', format(endDateFilter, 'yyyy-MM-dd'));
            }
            if (dateFilterType) {
                params.append('date_filter_type', dateFilterType);
            }
            if (bookTitleFilter) {
                params.append('book_title', bookTitleFilter);
            }

            const apiUrl = `/api/lendings?${params.toString()}`;
            const response = await apiCall(apiUrl, {}, 'GET', token);

            if (response.success) {
                // Process lendings to determine 'late' status
                const processedLendings = response.data.map(lending => {
                    const today = new Date();
                    const returnDate = parseISO(lending.return_date);
                    const isLate = lending.status === 'pending' && isPast(returnDate) && !isToday(returnDate);

                    let daysInfo = '';
                    if (lending.status === 'pending') {
                        const daysDiff = differenceInDays(returnDate, today);
                        if (isLate) {
                            daysInfo = `Late for ${Math.abs(daysDiff)} days`;
                        } else if (daysDiff > 0) {
                            daysInfo = `${daysDiff} days to return`;
                        } else if (isToday(returnDate)) {
                            daysInfo = `Due today`;
                        }
                    }

                    return {
                        ...lending,
                        isLate, // Add a computed property
                        daysInfo, // Add days info string
                    };
                });

                // Apply client-side filtering for 'late' or 'all' status
                const filteredLendings = processedLendings.filter(lending => {
                    if (filterStatus === 'late') {
                        return lending.isLate;
                    }
                    // For 'all', 'pending', 'returned', the backend should handle the primary filter,
                    // but 'pending' might include future returns, so we might re-filter here
                    // if (filterStatus === 'pending') {
                    //     return lending.status === 'pending'; // This logic might be redundant if backend is strict
                    // }
                    // if (filterStatus === 'returned') {
                    //     return lending.status === 'returned';
                    // }
                    return true; // For 'all' and statuses handled by backend
                });

                setCurrentLendings(filteredLendings);
            } else {
                setError(response.message || 'Failed to fetch current lendings.');
            }
        } catch (err) {
            console.error('Network error fetching current lendings:', err);
            setError('Network error or server issue. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedHallId, filterStatus, sortOrder, dateFilterType, startDateFilter, endDateFilter, bookTitleFilter]);

    useEffect(() => {
        if (token) {
            fetchCurrentLendings();
        }
    }, [token, fetchCurrentLendings]);

    // Effect to determine if any filter is active
    useEffect(() => {
        const active = selectedHallId !== '' ||
                       filterStatus !== 'pending' || // 'pending' is default
                       sortOrder !== 'desc' || // 'desc' is default
                       dateFilterType !== 'return_date' || // 'return_date' is default
                       startDateFilter !== null ||
                       endDateFilter !== null ||
                       bookTitleFilter !== '';
        setIsFiltering(active);
    }, [selectedHallId, filterStatus, sortOrder, dateFilterType, startDateFilter, endDateFilter, bookTitleFilter]);


    const handleReturnBook = async (lendingId) => {
        if (!window.confirm("Are you sure you want to mark this book as returned?")) {
            return;
        }
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

    // Handle click outside for contact card
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contactCardRef.current && !contactCardRef.current.contains(event.target)) {
                if (!event.target.closest('[aria-label="Show borrower contact details"]')) {
                    setHoveredLendingId(null);
                }
            }
        };

        if (hoveredLendingId) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [hoveredLendingId]);

    const handleBookTitleFilterChange = (e) => {
        const value = e.target.value;
        setBookTitleFilter(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            // fetchCurrentLendings will be triggered by useEffect due to bookTitleFilter change
        }, 500); // Debounce for 500ms
    };

    const clearFilters = () => {
        setSelectedHallId('');
        setFilterStatus('pending');
        setSortOrder('desc');
        setDateFilterType('return_date');
        setStartDateFilter(null);
        setEndDateFilter(null);
        setBookTitleFilter('');
        // fetchCurrentLendings will be called via useEffect due to state changes
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Currently Borrowed Books</h2>

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
                        <option value="">All Halls</option>
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
                        <option value="returned">Returned</option>
                        <option value="late">Late</option> {/* New computed status */}
                        <option value="all">All Statuses</option>
                    </select>
                </div>

                {/* Sort by Return Date */}
                <div>
                    <label htmlFor="sort-order" className="block text-gray-700 font-medium text-sm mb-1">Sort by Return Date:</label>
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

                {/* Date Filter Type (Issue Date vs Return Date) */}
                <div>
                    <label htmlFor="date-filter-type" className="block text-gray-700 font-medium text-sm mb-1">Date Filter Type:</label>
                    <select
                        id="date-filter-type"
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="return_date">Return Date</option>
                        <option value="issue_date">Issue Date</option>
                    </select>
                </div>

                {/* Date Range Filter - Start Date */}
                <div>
                    <label htmlFor="start-date-filter" className="block text-gray-700 font-medium text-sm mb-1">From Date ({dateFilterType === 'issue_date' ? 'Issued' : 'Return'}):</label>
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
                    <label htmlFor="end-date-filter" className="block text-gray-700 font-medium text-sm mb-1">To Date ({dateFilterType === 'issue_date' ? 'Issued' : 'Return'}):</label>
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
                    <p className="ml-2 text-gray-600">Loading lendings...</p>
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

            {!loading && currentLendings.length === 0 && !error && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                    <AlertTitle>No Lendings Found</AlertTitle>
                    <AlertDescription>No books currently lent match your current filters.</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {currentLendings.map((lending) => (
                    <div key={lending.lending_id} className={`border rounded-md p-4 bg-gray-50 shadow-sm relative ${lending.isLate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
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
                                    onClick={() => setHoveredLendingId(hoveredLendingId === lending.lending_id ? null : lending.lending_id)}
                                    aria-label="Show borrower contact details"
                                >
                                    <InfoIcon />
                                </button>
                            </p>
                            <p><span className="font-semibold">Issue Date:</span> {format(parseISO(lending.issue_date), 'MMM dd, yyyy')}</p>
                            <p><span className="font-semibold">Return Date:</span> {format(parseISO(lending.return_date), 'MMM dd, yyyy')}</p>
                            <p><span className="font-semibold">Status:</span> {lending.status}</p>
                            {lending.daysInfo && (
                                <p className={`font-semibold flex items-center ${lending.isLate ? 'text-red-600' : 'text-blue-600'}`}>
                                    {lending.isLate && <TriangleAlert className="mr-1 h-4 w-4" />}
                                    {lending.daysInfo}
                                </p>
                            )}
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
                            {lending.status === 'pending' && ( // Only show return button for pending lendings
                                <Button
                                    onClick={() => handleReturnBook(lending.lending_id)}
                                    style={{ backgroundColor: buttonGreen }}
                                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        'Return Book'
                                    )}
                                </Button>
                            )}
                            {lending.status !== 'pending' && (
                                <p className="text-gray-500 italic">This book has been {lending.status}.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LendingBooks;