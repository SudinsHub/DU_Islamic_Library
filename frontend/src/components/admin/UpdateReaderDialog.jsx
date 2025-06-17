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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { apiCall } from '@/utils/ApiCall';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

const UpdateReaderDialog = ({ isOpen, onClose, reader, onUpdateSuccess }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        registration_no: '',
        session: '',
        email: '',
        contact: '',
        hall_id: '',
        dept_id: '',
        isVerified: false,
        total_points: 0,
        gender: '',
        password: '', // For password update
        password_confirmation: '' // For password confirmation
    });
    const [halls, setHalls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingHallsAndDepts, setLoadingHallsAndDepts] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen && reader) {
            // Set initial form data from the current reader, ensure all fields are present
            setFormData({
                name: reader.name || '',
                registration_no: reader.registration_no || '',
                session: reader.session || '',
                email: reader.email || '',
                contact: reader.contact || '',
                hall_id: reader.hall_id || '',
                dept_id: reader.dept_id || '',
                isVerified: reader.isVerified || false,
                total_points: reader.total_points || 0,
                gender: reader.gender || '',
                password: '', // Passwords are not pre-filled for security
                password_confirmation: ''
            });
            fetchHallsAndDepartments();
        } else if (!isOpen) {
            // Reset form data and errors when dialog closes
            setFormData({
                name: '', registration_no: '', session: '', email: '', contact: '',
                hall_id: '', dept_id: '', isVerified: false, total_points: 0, gender: '',
                password: '', password_confirmation: ''
            });
            setFormErrors({});
        }
    }, [isOpen, reader, token]); // Depend on isOpen and reader to reset/load data

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
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        // Basic client-side validation for password confirmation
        if (formData.password && formData.password !== formData.password_confirmation) {
            setFormErrors(prev => ({ ...prev, password_confirmation: 'Passwords do not match.' }));
            setSubmitting(false);
            return;
        }

        const dataToSend = { ...formData };
        if (!dataToSend.password) { // Don't send password fields if empty
            delete dataToSend.password;
            delete dataToSend.password_confirmation;
        }

        try {
            const response = await apiCall(`/api/readers/${reader.reader_id}`, dataToSend, 'PUT', token);
            toast.success(response.message || 'Reader updated successfully!');
            onUpdateSuccess(); // Callback to refresh parent list
            onClose(); // Close dialog
        } catch (err) {
            console.error("Failed to update reader:", err);
            const apiErrors = err.errors || {}; // Assuming API returns errors object
            setFormErrors(apiErrors);
            toast.error(err.message || 'Failed to update reader.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Reader: {reader?.name}</DialogTitle>
                    <DialogDescription>
                        Make changes to reader profile here. Click save when you're done.
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
                        <Label htmlFor="gender" className="text-right">Gender</Label>
                        <Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender} id="gender">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="">N/A</SelectItem>
                            </SelectContent>
                        </Select>
                        {formErrors.gender && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.gender[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hall_id" className="text-right">Hall</Label>
                        {loadingHallsAndDepts ? (
                            <div className="col-span-3 flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <Select onValueChange={(value) => handleSelectChange('hall_id', value)} value={formData.hall_id} id="hall_id">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Hall" />
                                </SelectTrigger>
                                <SelectContent>
                                    {halls.map(hall => (
                                        <SelectItem key={hall.hall_id} value={hall.hall_id}>{hall.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {formErrors.hall_id && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.hall_id[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept_id" className="text-right">Department</Label>
                        {loadingHallsAndDepts ? (
                            <div className="col-span-3 flex items-center gap-2 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                        ) : (
                            <Select onValueChange={(value) => handleSelectChange('dept_id', value)} value={formData.dept_id} id="dept_id">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.dept_id} value={dept.dept_id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {formErrors.dept_id && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.dept_id[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="total_points" className="text-right">Total Points</Label>
                        <Input id="total_points" type="number" value={formData.total_points} onChange={handleChange} className="col-span-3" />
                        {formErrors.total_points && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.total_points[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isVerified" className="text-right">Verified</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Checkbox id="isVerified" checked={formData.isVerified} onCheckedChange={(checked) => handleSelectChange('isVerified', checked)} />
                        </div>
                        {formErrors.isVerified && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.isVerified[0]}</p>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" placeholder="Leave blank to keep current" />
                        {formErrors.password && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.password[0]}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password_confirmation" className="text-right">Confirm Password</Label>
                        <Input id="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} className="col-span-3" />
                        {formErrors.password_confirmation && <p className="col-span-4 text-red-500 text-xs text-right">{formErrors.password_confirmation[0]}</p>}
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

export default UpdateReaderDialog;
