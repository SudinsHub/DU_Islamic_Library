import React, { useEffect, useState } from 'react';
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input'; // For filter input
import { Label } from '@/components/ui/label'; // For filter labels
import { Checkbox } from '@/components/ui/checkbox'; // For filter checkboxes
// Removed Shadcn Select imports as they are being replaced
import { Loader2, Pencil, Trash2, Eye, Search, X } from 'lucide-react'; // Added Search and X icons
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

import UpdateVolunteerDialog from '@/components/admin/UpdateVolunteerDialog'; // Import the new dialog

const AdminVolunteersPage = () => {
    const { token } = useAuth();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState({}); // To track submission state for individual volunteers

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // For total volunteers count

    // Filter states
    const [filterName, setFilterName] = useState('');
    const [filterHallId, setFilterHallId] = useState('');
    const [filterIsVerified, setFilterIsVerified] = useState(false);
    const [filterIsAvailable, setFilterIsAvailable] = useState(false);
    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);

    // Update Dialog states
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    // Delete Confirmation Dialog states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [volunteerToDeleteId, setVolunteerToDeleteId] = useState(null);

    const fetchHalls = async () => {
        setLoadingHalls(true);
        try {
            const response = await apiCall('/api/halls', {}, 'GET', token);
            setHalls(response || []);
        } catch (err) {
            console.error("Failed to fetch halls for filter:", err);
            toast.error("Failed to load hall options for filter.");
        } finally {
            setLoadingHalls(false);
        }
    };

    const fetchVolunteers = async (page = 1, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ page });

            if (filters.name) queryParams.append('name', filters.name);
            if (filters.hall_id) queryParams.append('hall_id', filters.hall_id);
            if (filters.isVerified) queryParams.append('isVerified', true); // Send true if checked
            if (filters.isAvailable) queryParams.append('isAvailable', true); // Send true if checked

            const response = await apiCall(`/api/vol?${queryParams.toString()}`, {}, "GET", token);
            setVolunteers(response.data || []); // Laravel pagination returns 'data' array
            setTotalPages(response.last_page);
            setCurrentPage(response.current_page);
            setTotalItems(response.total);
        } catch (err) {
            console.error("Failed to fetch volunteers:", err);
            setError(err.message || "Failed to load volunteers. Please try again.");
            toast.error(err.message || "Failed to load volunteers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchHalls(); // Fetch halls when component mounts
            fetchVolunteers(currentPage, { filterName, filterHallId, filterIsVerified, filterIsAvailable });
        }
    }, [token, currentPage]); // Re-fetch on token or currentPage change

    // Handler to apply filters (resets to page 1)
    const applyFilters = () => {
        setCurrentPage(1); // Always reset to the first page when applying new filters
        fetchVolunteers(1, {
            name: filterName,
            hall_id: filterHallId,
            isVerified: filterIsVerified,
            isAvailable: filterIsAvailable
        });
    };

    // Handler to clear filters
    const clearFilters = () => {
        setFilterName('');
        setFilterHallId('');
        setFilterIsVerified(false);
        setFilterIsAvailable(false);
        setCurrentPage(1); // Always reset to the first page when clearing filters
        fetchVolunteers(1, {}); // Fetch all volunteers
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            // Fetch volunteers with current filters when changing pages
            fetchVolunteers(page, {
                name: filterName,
                hall_id: filterHallId,
                isVerified: filterIsVerified,
                isAvailable: filterIsAvailable
            });
        }
    };

    const handleEditVolunteer = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setIsUpdateDialogOpen(true);
    };

    const handleDeleteVolunteerConfirm = (volunteerId) => {
        setVolunteerToDeleteId(volunteerId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteVolunteer = async () => {
        if (!volunteerToDeleteId) return;

        setSubmitting(prev => ({ ...prev, [volunteerToDeleteId]: true }));
        try {
            const response = await apiCall(`/api/vol/${volunteerToDeleteId}`, {}, "DELETE", token);
            toast.success(response.message || 'Volunteer deleted successfully!');
            fetchVolunteers(currentPage, { filterName, filterHallId, filterIsVerified, filterIsAvailable }); // Re-fetch the list to update UI
        } catch (err) {
            console.error("Failed to delete volunteer:", err);
            toast.error(err.message || 'Failed to delete volunteer.');
        } finally {
            setSubmitting(prev => ({ ...prev, [volunteerToDeleteId]: false }));
            setIsDeleteDialogOpen(false); // Close dialog
            setVolunteerToDeleteId(null);
        }
    };

    if (loading && !volunteers.length) { // Only show full loading screen if no data is present yet
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Loading volunteers...</p>
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
                    <Button onClick={() => fetchVolunteers(currentPage, { filterName, filterHallId, filterIsVerified, filterIsAvailable })}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Volunteers</h2>

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
                        {loadingHalls ? (
                             <div className="flex items-center gap-2 text-gray-500 h-10 px-3 py-2 border rounded-md w-full bg-gray-50">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading Halls...
                            </div>
                        ) : (
                            <select
                                id="filterHall"
                                name="filterHallId" // Important for handleChange to pick up the value
                                value={filterHallId}
                                onChange={(e) => setFilterHallId(e.target.value)}
                                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes for styling
                            >
                                <option value="">All Halls</option> {/* Option to clear hall filter */}
                                {halls.map((hall) => (
                                    <option key={hall.hall_id} value={hall.hall_id}>
                                        {hall.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="filterIsVerified"
                            checked={filterIsVerified}
                            onCheckedChange={setFilterIsVerified}
                        />
                        <Label htmlFor="filterIsVerified" className="text-sm font-medium text-gray-700">Verified Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="filterIsAvailable"
                            checked={filterIsAvailable}
                            onCheckedChange={setFilterIsAvailable}
                        />
                        <Label htmlFor="filterIsAvailable" className="text-sm font-medium text-gray-700">Available Only</Label>
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

            {volunteers.length === 0 && !loading ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No volunteers found matching your criteria.</p>
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
                                        Room No.
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Available
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Verified
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {volunteers.map((volunteer) => (
                                    <tr key={volunteer.volunteer_id} className="hover:bg-gray-50">
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.name}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.registration_no}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.email}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.contact}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.hall ? volunteer.hall.name : 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.department ? volunteer.department.name : 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{volunteer.room_no}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {volunteer.isAvailable ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-red-600">No</span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {volunteer.isVerified ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-red-600">No</span>
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditVolunteer(volunteer)}
                                                    disabled={submitting[volunteer.volunteer_id]}
                                                    title="Edit Volunteer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDeleteVolunteerConfirm(volunteer.volunteer_id)}
                                                    disabled={submitting[volunteer.volunteer_id]}
                                                    title="Delete Volunteer"
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

            {/* Update Volunteer Dialog */}
            {selectedVolunteer && (
                <UpdateVolunteerDialog
                    isOpen={isUpdateDialogOpen}
                    onClose={() => setIsUpdateDialogOpen(false)}
                    volunteer={selectedVolunteer}
                    onUpdateSuccess={() => fetchVolunteers(currentPage, { filterName, filterHallId, filterIsVerified, filterIsAvailable })} // Refresh list on successful update, maintaining filters
                />
            )}

            {/* Delete Volunteer Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the volunteer
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteVolunteer} disabled={submitting[volunteerToDeleteId]}>
                            {submitting[volunteerToDeleteId] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminVolunteersPage;
