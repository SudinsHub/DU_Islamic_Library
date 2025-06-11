import React, { useEffect, useState } from 'react';
import { apiCall } from '@/utils/ApiCall'; // Adjust path as needed
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { toast } from 'react-toastify';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Shadcn AlertDialog components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Make sure this path is correct

const VolunteerVerify = () => {
    const { token } = useAuth();
    const [unverifiedVolunteers, setUnverifiedVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState({}); // To track submission state for individual volunteers
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
    const [dialogType, setDialogType] = useState(''); // 'verify' or 'delete'

    const fetchUnverifiedVolunteers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall('/api/vol/unverified', {}, "GET", token);
            setUnverifiedVolunteers(response.unverifiedVolunteers || []);
        } catch (err) {
            console.error("Failed to fetch unverified volunteers:", err);
            setError(err.message || "Failed to load unverified volunteers. Please try again.");
            toast.error(err.message || "Failed to load unverified volunteers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUnverifiedVolunteers();
        }
    }, [token]);

    const handleVerifyVolunteer = async (volunteerId) => {
        setSubmitting(prev => ({ ...prev, [volunteerId]: true }));
        try {
            const response = await apiCall('/api/vol/verify', { volunteer_id: volunteerId }, "POST", token);
            toast.success(response.message || 'Volunteer verified successfully!');
            fetchUnverifiedVolunteers();
        } catch (err) {
            console.error("Failed to verify volunteer:", err);
            toast.error(err.message || 'Failed to verify volunteer.');
        } finally {
            setSubmitting(prev => ({ ...prev, [volunteerId]: false }));
            setDialogOpen(false); // Close dialog after action
        }
    };

    const handleDeleteVolunteer = async (volunteerId) => {
        setSubmitting(prev => ({ ...prev, [volunteerId]: true }));
        try {
            const response = await apiCall(`/api/vol/deleteVolunteer`, { "volunteer_id": volunteerId }, "DELETE", token);
            toast.success(response.message || 'Volunteer deleted successfully!');
            fetchUnverifiedVolunteers();
        } catch (err) {
            console.error("Failed to delete volunteer:", err);
            toast.error(err.message || 'Failed to delete volunteer.');
        } finally {
            setSubmitting(prev => ({ ...prev, [volunteerId]: false }));
            setDialogOpen(false); // Close dialog after action
        }
    };

    const openConfirmDialog = (volunteerId, type) => {
        setSelectedVolunteerId(volunteerId);
        setDialogType(type);
        setDialogOpen(true);
    };

    const confirmAction = () => {
        if (selectedVolunteerId) {
            if (dialogType === 'verify') {
                handleVerifyVolunteer(selectedVolunteerId);
            } else if (dialogType === 'delete') {
                handleDeleteVolunteer(selectedVolunteerId);
            }
        }
    };

    if (loading) {
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
                    <Button onClick={fetchUnverifiedVolunteers}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Unverified Volunteers</h2>

            {unverifiedVolunteers.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No unverified volunteers found at the moment.</p>
                </div>
            ) : (
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
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {unverifiedVolunteers.map((volunteer) => (
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
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => openConfirmDialog(volunteer.volunteer_id, 'verify')}
                                                disabled={submitting[volunteer.volunteer_id]}
                                            >
                                                {submitting[volunteer.volunteer_id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Verify
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => openConfirmDialog(volunteer.volunteer_id, 'delete')}
                                                disabled={submitting[volunteer.volunteer_id]}
                                            >
                                                {submitting[volunteer.volunteer_id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Shadcn AlertDialog for confirmations */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {dialogType === 'verify' ? "Verify Volunteer" : "Delete Volunteer"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogType === 'verify'
                                ? "Are you sure you want to verify this volunteer?"
                                : "Are you sure you want to delete this volunteer? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAction}>
                            {dialogType === 'verify' ? "Verify" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default VolunteerVerify;