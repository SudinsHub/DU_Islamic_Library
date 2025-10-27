// src/components/Admin/EntityManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import axios from 'axios'; 

// Base URL for API calls
const baseUrl = import.meta.env.VITE_API_URL || '';

// Helper function to capitalize the first letter of a string
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// --- Entity Form Dialog Component ---
const EntityFormDialog = ({
  entityType,
  entity, // The entity object being edited, or null for new
  onSuccess,
  isOpen,
  onOpenChange,
  apiEndpoint,
}) => {
  const { token } = useAuth();

  // Dynamically set default values based on entityType and existing entity
  const defaultValues = {
    name: entity?.name || '',
    ...(entityType === 'hall' && { gender: entity?.gender || '' }), // Only for Hall
  };

  const form = useForm({
    defaultValues: defaultValues,
  });

  // Reset form when dialog opens or entity changes
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [entity, isOpen, form]);

  const onSubmit = async (values) => {
    try {
      if (!token) {
        toast.error("Authentication token is missing.");
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (entity) {
        // Update existing entity
        await axios.put(`${baseUrl}${apiEndpoint}/${entity[entityType + '_id']}`, values, { headers });
        toast.success(`${capitalize(entityType)} updated successfully!`);
      } else {
        // Create new entity
        await axios.post(`${baseUrl}${apiEndpoint}`, values, { headers });
        toast.success(`${capitalize(entityType)} added successfully!`);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(`${capitalize(entityType)} form submission error:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to save ${entityType}.`;
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entity ? `Edit ${capitalize(entityType)}` : `Add New ${capitalize(entityType)}`}</DialogTitle>
          <DialogDescription>
            {entity ? `Edit the details of this ${entityType}.` : `Add a new ${entityType} to the system.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`Enter ${entityType} name`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {entityType === 'hall' && (
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit">{entity ? 'Save changes' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Entity Management Page Component ---
const EntityManagement = ({ entityType, apiEndpoint, columns }) => {
  const { token } = useAuth();
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const fetchEntities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      if (!token) throw new Error("Authentication token missing.");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${baseUrl}${apiEndpoint}/get-paginated`, {
        params: { page },
        headers,
      });

      // Assuming paginated data structure from Laravel API:
      // { data: [...], current_page: N, last_page: M, ... }
      setEntities(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error(`Failed to fetch ${entityType}s:`, error);
      toast.error(error.response?.data?.message || error.message || `Failed to fetch ${entityType}s.`);
    } finally {
      setLoading(false);
    }
  }, [token, apiEndpoint, entityType]);

  useEffect(() => {
    fetchEntities(currentPage);
  }, [fetchEntities, currentPage]);

  const handleAddClick = () => {
    setEditingEntity(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (entity) => {
    setEditingEntity(entity);
    setIsFormOpen(true);
  };

  const handleDelete = async (entityId) => {
    if (!window.confirm(`Are you sure you want to delete this ${entityType}?`)) {
      return;
    }
    try {
      if (!token) throw new Error("Authentication token missing.");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.delete(`${baseUrl}${apiEndpoint}/${entityId}`, { headers });
      toast.success(`${capitalize(entityType)} deleted successfully!`);
      fetchEntities(currentPage); // Re-fetch to update the list
    } catch (error) {
      console.error(`Failed to delete ${entityType}:`, error);
      toast.error(error.response?.data?.message || error.message || `Failed to delete ${entityType}.`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage {capitalize(entityType)}s</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClick}>Add New {capitalize(entityType)}</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading {entityType}s...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.header}</TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.length > 0 ? (
                  entities.map((entity) => (
                    <TableRow key={entity[entityType + '_id']}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>{entity[col.key]}</TableCell>
                      ))}
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(entity)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(entity[entityType + '_id'])}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                      No {entityType}s found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {lastPage}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
              disabled={currentPage === lastPage}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <EntityFormDialog
        entityType={entityType}
        entity={editingEntity}
        onSuccess={() => fetchEntities(currentPage)}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        apiEndpoint={apiEndpoint}
      />
    </div>
  );
};

const EntityManagementPage = () => {
    const hallColumns = [
    { key: 'name', header: 'Hall Name' },
    { key: 'gender', header: 'Gender' },
  ];

  const departmentColumns = [
    { key: 'name', header: 'Department Name' },
    // Add other fields if you want to display them from the Department model
  ];

  const authorColumns = [
    { key: 'name', header: 'Author Name' },
  ];

  const categoryColumns = [
    { key: 'name', header: 'Category Name' },
  ];

  const publisherColumns = [
    { key: 'name', header: 'Publisher Name' },
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-4">
    {/* Example usage of your existing Book Management Page */}
    {/* <AdminBookManagementPage /> */}
    {/* Example usage of the new generic Entity Management Page */}
    <EntityManagement
      entityType="hall"
      apiEndpoint="/api/halls"
      columns={hallColumns}
    />
    <hr className="my-10" />
    <EntityManagement
      entityType="department"
      apiEndpoint="/api/departments"
      columns={departmentColumns}
    />
    <hr className="my-10" />
    <EntityManagement
      entityType="author"
      apiEndpoint="/api/authors"
      columns={authorColumns}
    />
    <hr className="my-10" />
    <EntityManagement
      entityType="category"
      apiEndpoint="/api/categories"
      columns={categoryColumns}
    />
    <hr className="my-10" />
    <EntityManagement
      entityType="publisher"
      apiEndpoint="/api/publishers"
      columns={publisherColumns}
    />
  </div>
  );
};

export default EntityManagementPage;