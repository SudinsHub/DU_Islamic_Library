import React, { useEffect, useState } from 'react';
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input'; // For filter input
import { Label } from '@/components/ui/label'; // For filter labels
// Removed Checkbox for 'isVerified' as it's no longer a filter
import { Loader2, Pencil, Trash2, Search, X } from 'lucide-react'; // Added Search and X icons
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

import UpdateReaderDialog from '@/components/admin/UpdateReaderDialog'; // Import the new dialog

const AdminReadersPage = () => {
    const { token } = useAuth();
    const [readers, setReaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState({}); // To track submission state for individual readers

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // For total readers count

    // Filter states
    const [filterName, setFilterName] = useState('');
    const [filterHallId, setFilterHallId] = useState('');
    const [filterDeptId, setFilterDeptId] = useState(''); // New state for department filter
    const [halls, setHalls] = useState([]);
    const [departments, setDepartments] = useState([]); // New state for departments
    const [loadingHallsAndDepts, setLoadingHallsAndDepts] = useState(true);

    // Update Dialog states
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedReader, setSelectedReader] = useState(null);

    // Delete Confirmation Dialog states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [readerToDeleteId, setReaderToDeleteId] = useState(null);

    const fetchHallsAndDepartments = async () => {
        setLoadingHallsAndDepts(true);
        try {
            const [hallsRes, deptsRes] = await Promise.all([
                apiCall('/api/halls', {}, 'GET', token),
                apiCall('/api/departments', {}, 'GET', token)
            ]);
            setHalls(hallsRes || []);
            setDepartments(deptsRes || []);
        } catch (err) {
            console.error("Failed to fetch halls or departments for filter:", err);
            toast.error("Failed to load hall/department options for filter.");
        } finally {
            setLoadingHallsAndDepts(false);
        }
    };

    const fetchReaders = async (page = 1, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ page });

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.hall_id) queryParams.append('hall_id', filters.hall_id);
            if (filters.dept_id) queryParams.append('dept_id', filters.dept_id); // Append department filter

            const response = await apiCall(`/api/readers?${queryParams.toString()}`, {}, "GET", token);
            setReaders(response.data || []); // Laravel pagination returns 'data' array
            setTotalPages(response.last_page);
            setCurrentPage(response.current_page);
            setTotalItems(response.total);
        } catch (err) {
            console.error("Failed to fetch readers:", err);
            setError(err.message || "Failed to load readers. Please try again.");
            toast.error(err.message || "Failed to load readers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchHallsAndDepartments(); // Fetch halls and departments when component mounts
            fetchReaders(currentPage, { filterName, filterHallId, filterDeptId });
        }
    }, [token, currentPage]); // Re-fetch on token or currentPage change

    // Handler to apply filters (resets to page 1)
    const applyFilters = () => {
        setCurrentPage(1); // Always reset to the first page when applying new filters
        fetchReaders(1, {
            name: filterName,
            hall_id: filterHallId,
            dept_id: filterDeptId
        });
    };

    // Handler to clear filters
    const clearFilters = () => {
        setFilterName('');
        setFilterHallId('');
        setFilterDeptId('');
        setCurrentPage(1); // Always reset to the first page when clearing filters
        fetchReaders(1, {}); // Fetch all readers
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            // Fetch readers with current filters when changing pages
            fetchReaders(page, {
                name: filterName,
                hall_id: filterHallId,
                dept_id: filterDeptId
            });
        }
    };

    const handleEditReader = (reader) => {
        setSelectedReader(reader);
        setIsUpdateDialogOpen(true);
    };

    const handleDeleteReaderConfirm = (readerId) => {
        setReaderToDeleteId(readerId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteReader = async () => {
        if (!readerToDeleteId) return;

        setSubmitting(prev => ({ ...prev, [readerToDeleteId]: true }));
        try {
            const response = await apiCall(`/api/readers/${readerToDeleteId}`, {}, "DELETE", token);
            toast.success(response.message || 'Reader deleted successfully!');
            fetchReaders(currentPage, { filterName, filterHallId, filterDeptId }); // Re-fetch the list to update UI, maintaining filters
        } catch (err) {
            console.error("Failed to delete reader:", err);
            toast.error(err.message || 'Failed to delete reader.');
        } finally {
            setSubmitting(prev => ({ ...prev, [readerToDeleteId]: false }));
            setIsDeleteDialogOpen(false); // Close dialog
            setReaderToDeleteId(null);
        }
    };

    if (loading && !readers.length) { // Only show full loading screen if no data is present yet
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Loading readers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center mt-4">
                    <Button onClick={() => fetchReaders(currentPage, { filterName, filterHallId, filterDeptId })}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Readers</h2>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="filterName" className="mb-2 block text-sm font-medium text-gray-700">Name</Label>
                        <Input
                            id="filterName"
                            placeholder="Filter by name"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Label htmlFor="filterHall" className="mb-2 block text-sm font-medium text-gray-700">Hall</Label>
                        {loadingHallsAndDepts ? (
                             <div className="flex items-center gap-2 text-gray-500 h-10 px-3 py-2 border rounded-md w-full bg-gray-50">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading Halls...
                            </div>
                        ) : (
                            <select
                                id="filterHall"
                                name="filterHallId"
                                value={filterHallId}
                                onChange={(e) => setFilterHallId(e.target.value)}
                                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Halls</option>
                                {halls.map((hall) => (
                                    <option key={hall.hall_id} value={hall.hall_id}>
                                        {hall.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="filterDepartment" className="mb-2 block text-sm font-medium text-gray-700">Department</Label>
                        {loadingHallsAndDepts ? (
                             <div className="flex items-center gap-2 text-gray-500 h-10 px-3 py-2 border rounded-md w-full bg-gray-50">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading Departments...
                            </div>
                        ) : (
                            <select
                                id="filterDepartment"
                                name="filterDeptId"
                                value={filterDeptId}
                                onChange={(e) => setFilterDeptId(e.target.value)}
                                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept.dept_id} value={dept.dept_id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={clearFilters} variant="outline">
                        <X className="mr-2 h-4 w-4" /> Clear Filters
                    </Button>
                    <Button onClick={applyFilters}>
                        <Search className="mr-2 h-4 w-4" /> Apply Filters
                    </Button>
                </div>
            </div>

            {readers.length === 0 && !loading ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No readers found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Reg. No.
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hall
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Session
                                    </th>
                                    {/* Removed Verified column */}
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Points
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {readers.map((reader) => (
                                    <tr key={reader.reader_id} className="hover:bg-gray-50">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.name}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.registration_no}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.email}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.contact}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.hall ? reader.hall.name : 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.department ? reader.department.name : 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.session ? reader.session : 'N/A'}</p>
                                        </td>
                                        {/* Removed Verified column data */}
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{reader.total_points}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditReader(reader)}
                                                    disabled={submitting[reader.reader_id]}
                                                    title="Edit Reader"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDeleteReaderConfirm(reader.reader_id)}
                                                    disabled={submitting[reader.reader_id]}
                                                    title="Delete Reader"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(page)}
                                            isActive={page === currentPage}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

            {/* Update Reader Dialog */}
            {selectedReader && (
                <UpdateReaderDialog
                    isOpen={isUpdateDialogOpen}
                    onClose={() => setIsUpdateDialogOpen(false)}
                    reader={selectedReader}
                    onUpdateSuccess={() => fetchReaders(currentPage, { filterName, filterHallId, filterDeptId })} // Refresh list on successful update, maintaining filters
                />
            )}

            {/* Delete Reader Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the reader
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReader} disabled={submitting[readerToDeleteId]}>
                            {submitting[readerToDeleteId] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminReadersPage;
