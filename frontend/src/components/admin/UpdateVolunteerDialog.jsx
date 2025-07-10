import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// Removed Shadcn Select imports as they are being replaced
import { Loader2 } from 'lucide-react';
import { apiCall } from '@/utils/ApiCall'; // Original import
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext'; // Original import

const UpdateVolunteerDialog = ({ isOpen, onClose, volunteer, onUpdateSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        registration_no: '',
        email: '',
        contact: '',
        address: '',
        hall_id: '',
        dept_id: '',
        session: '',
        isAvailable: true,
        isVerified: false,
        room_no: '',
        // Removed password and password_confirmation from state
    });
    const [halls, setHalls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingHallsAndDepts, setLoadingHallsAndDepts] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});


    useEffect(() => {
        if (isOpen && volunteer) {
            // Set initial form data from the current volunteer
            setFormData({
                name: volunteer.name || '',
                registration_no: volunteer.registration_no || '',
                email: volunteer.email || '',
                contact: volunteer.contact || '',
                address: volunteer.address || '',
                hall_id: volunteer.hall_id || '',
                dept_id: volunteer.dept_id || '',
                session: volunteer.session || '',
                isAvailable: volunteer.isAvailable || false,
                isVerified: volunteer.isVerified || false,
                room_no: volunteer.room_no || '',
                // Passwords are not pre-filled and not part of the update form
            });
            fetchHallsAndDepartments();
        } else if (!isOpen) {
            // Reset form data and errors when dialog closes
            setFormData({
                name: '', registration_no: '', email: '', contact: '', address: '',
                hall_id: '', dept_id: '', session: '', isAvailable: true, isVerified: false,
                room_no: '', // No password fields to reset
            });
            setFormErrors({});
        }
    }, [isOpen, volunteer, token]); // Depend on isOpen and volunteer to reset/load data

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
            console.error("Failed to fetch halls or departments:", err);
            toast.error("Failed to load hall/department options.");
        } finally {
            setLoadingHallsAndDepts(false);
        }
    };

    const handleChange = (e) => {
        const { id, value, type, checked, name } = e.target; // Added 'name' for select elements
        setFormData(prev => ({
            ...prev,
            // Use 'name' for select elements, 'id' for others. `name` is used for the native select elements.
            [name || id]: type === 'checkbox' ? checked : value
        }));
    };

    // Removed handleSelectChange as it's no longer needed with native select

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        // Removed password validation as there are no password fields

        const dataToSend = { ...formData };
        // No need to delete password fields as they are no longer in formData

        try {
            const response = await apiCall(`/api/vol/${volunteer.volunteer_id}`, dataToSend, 'PUT', token);
            toast.success(response.message || 'Volunteer updated successfully!');
            onUpdateSuccess(); // Callback to refresh parent list
            onClose(); // Close dialog
        } catch (err) {
            console.error("Failed to update volunteer:", err);
            const apiErrors = err.errors || {}; // Assuming API returns errors object
            setFormErrors(apiErrors);
            toast.error(err.message || 'Failed to update volunteer.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Volunteer: {volunteer?.name}</DialogTitle>
                    <DialogDescription>
                        Make changes to volunteer profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                        {formErrors.name && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.name[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                        {formErrors.email && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.email[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="registration_no" className="text-right">Reg. No.</Label>
                        <Input id="registration_no" value={formData.registration_no} onChange={handleChange} className="col-span-3" />
                        {formErrors.registration_no && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.registration_no[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="session" className="text-right">Session</Label>
                        <Input id="session" value={formData.session} onChange={handleChange} className="col-span-3" />
                        {formErrors.session && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.session[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">Contact</Label>
                        <Input id="contact" value={formData.contact} onChange={handleChange} className="col-span-3" />
                        {formErrors.contact && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.contact[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input id="address" value={formData.address} onChange={handleChange} className="col-span-3" />
                        {formErrors.address && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.address[0]}</p>}
                    </div>

                    {/* Custom Select for Hall */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hall_id" className="text-right">Hall</Label>
                        {loadingHallsAndDepts ? (
                            <div className="col-span-3 flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <select
                                id="hall_id"
                                name="hall_id" // Important for handleChange to pick up the value
                                value={formData.hall_id}
                                onChange={handleChange}
                                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes for styling
                            >
                                <option value="" disabled>Select Hall</option>
                                {halls.map(hall => (
                                    <option key={hall.hall_id} value={hall.hall_id}>{hall.name}</option>
                                ))}
                            </select>
                        )}
                        {formErrors.hall_id && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.hall_id[0]}</p>}
                    </div>

                    {/* Custom Select for Department */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept_id" className="text-right">Department</Label>
                        {loadingHallsAndDepts ? (
                            <div className="col-span-3 flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <select
                                id="dept_id"
                                name="dept_id" // Important for handleChange to pick up the value
                                value={formData.dept_id}
                                onChange={handleChange}
                                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes for styling
                            >
                                <option value="" disabled>Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.dept_id} value={dept.dept_id}>{dept.name}</option>
                                ))}
                            </select>
                        )}
                        {formErrors.dept_id && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.dept_id[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="room_no" className="text-right">Room No.</Label>
                        <Input id="room_no" type="number" value={formData.room_no} onChange={handleChange} className="col-span-3" />
                        {formErrors.room_no && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.room_no[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isAvailable" className="text-right">Available</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Checkbox id="isAvailable" checked={formData.isAvailable} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))} />
                        </div>
                        {formErrors.isAvailable && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.isAvailable[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isVerified" className="text-right">Verified</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Checkbox id="isVerified" checked={formData.isVerified} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))} />
                        </div>
                        {formErrors.isVerified && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.isVerified[0]}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateVolunteerDialog;
