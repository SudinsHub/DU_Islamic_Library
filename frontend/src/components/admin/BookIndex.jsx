// src/pages/books/index.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious} from '@/components/ui/pagination';
import { apiCall } from '@/utils/ApiCall';
import { useAuth } from '@/contexts/AuthContext';

// --- Zod Schemas for Validation ---
const bookSchema = z.object({
  book_id: z.string().uuid().optional(), // Optional for new books
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional().nullable(),
  author_id: z.string().uuid().nullable().optional(), // Allow null for new author by name
  publisher_id: z.string().uuid().nullable().optional(), // Allow null for new publisher by name
  category_id: z.string().uuid().nullable().optional(), // Allow null for new category by name
  author_name: z.string().optional().nullable(), // For creating new author
  publisher_name: z.string().optional().nullable(), // For creating new publisher
  category_name: z.string().optional().nullable(), // For creating new category
  image: typeof window === 'undefined' ? z.any().optional() : z.instanceof(File).optional().nullable(), // File object for upload
  image_url: z.string().optional().nullable(), // For displaying current image
});

// Using a custom transform to handle potentially empty strings from form inputs
// for optional/nullable fields to ensure they become null if empty.
// This is good practice for sending clean data to the backend.
const formSchema = bookSchema.transform(data => ({
  ...data,
  description: data.description === '' ? null : data.description,
  author_id: data.author_id === '' ? null : data.author_id,
  publisher_id: data.publisher_id === '' ? null : data.publisher_id,
  category_id: data.category_id === '' ? null : data.category_id,
  author_name: data.author_name === '' ? null : data.author_name,
  publisher_name: data.publisher_name === '' ? null : data.publisher_name,
  category_name: data.category_name === '' ? null : data.category_name,
  // image_url is handled explicitly in the onSubmit, no need to transform here.
}));


/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string|null} description
 * @property {string} author
 * @property {string} publisher
 * @property {string} category
 * @property {string|null} image_url
 * @property {string|null} author_id
 * @property {string|null} publisher_id
 * @property {string|null} category_id
 */

/**
 * @typedef {Object} Option
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} total
 * @property {number} from
 * @property {number} to
 */

/**
 * @typedef {BookFormValues}
 * @property {string} title
 * @property {string|null|undefined} description
 * @property {string|null|undefined} author_id
 * @property {string|null|undefined} publisher_id
 * @property {string|null|undefined} category_id
 * @property {string|null|undefined} author_name
 * @property {string|null|undefined} publisher_name
 * @property {string|null|undefined} category_name
 * @property {File|null|undefined} image
 * @property {string|null|undefined} image_url
 */


// --- Main Component ---
const BooksPage = () => {
  const queryClient = useQueryClient();
  const {token} = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  /** @type {[Book|null, React.Dispatch<React.SetStateAction<Book|null>>]} */
  const [selectedBook, setSelectedBook] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    publisher_id: '',
    author_id: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10); // Or use a select for this

  // --- Fetching Books ---
  const { data: booksData, isLoading: isLoadingBooks, error: booksError } = useQuery({
    queryKey: ['books', filters, currentPage, perPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...filters,
      });
      // Filter out empty string filters
      for (const key in filters) {
        if (filters[key] === '') {
          params.delete(key);
        }
      }

      const response = await apiCall(`/api/admin-books?${params.toString()}`, {}, 'GET', token);
      return response; // Assuming apicall directly returns the data object from the API
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  // --- Fetching Filter Options ---
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await apiCall('/api/categories', {}, 'GET', token)), // Adjust if your apicall returns { data: [...] }
    staleTime: Infinity,
  });

  const { data: authors = [], isLoading: isLoadingAuthors } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => (await apiCall('/api/authors', {}, 'GET', token)), // Adjust if your apicall returns { data: [...] }
    staleTime: Infinity,
  });

  const { data: publishers = [], isLoading: isLoadingPublishers } = useQuery({
    queryKey: ['publishers'],
    queryFn: async () => (await apiCall('/api/publishers', {}, 'GET', token)),
    staleTime: Infinity,
  });


  // --- Edit Form Setup ---
  const form = useForm({
    resolver: zodResolver(formSchema), // Use the transformed schema
    defaultValues: {
      title: '',
      description: '',
      author_id: '', // Use empty string for select defaults if null is not handled well
      publisher_id: '',
      category_id: '',
      author_name: '',
      publisher_name: '',
      category_name: '',
      image: null,
      image_url: null,
    },
  });

  // Populate form when a book is selected for editing
  useEffect(() => {
    if (selectedBook && isEditDialogOpen) {
      console.log('Selected Book:', selectedBook);
      
      form.reset({
        book_id: selectedBook.book_id,
        title: selectedBook.title,
        description: selectedBook.description || '', // Ensure empty string for textareas
        author_id: selectedBook.author_id || '',
        publisher_id: selectedBook.publisher_id || '',
        category_id: selectedBook.category_id || '',
        // If an ID exists, the name field should be empty as it's not used for existing entries
        author_name: selectedBook.author_id ? '' : (selectedBook.author || ''),
        publisher_name: selectedBook.publisher_id ? '' : (selectedBook.publisher || ''),
        category_name: selectedBook.category_id ? '' : (selectedBook.category || ''),
        image: null, // Clear image input on edit, new file must be selected
        image_url: selectedBook.image_url,
      });
    }
  }, [selectedBook, isEditDialogOpen, form]);

  // --- Update Book Mutation ---
  const updateBookMutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');

      // Conditionally append ID or Name for author, publisher, category
      // Backend expects either ID OR Name, not both for the "create if not exists" logic
      if (values.author_id) {
          formData.append('author_id', values.author_id);
      } else if (values.author_name) {
          formData.append('author_name', values.author_name);
      }

      if (values.publisher_id) {
          formData.append('publisher_id', values.publisher_id);
      } else if (values.publisher_name) {
          formData.append('publisher_name', values.publisher_name);
      }

      if (values.category_id) {
          formData.append('category_id', values.category_id);
      } else if (values.category_name) {
          formData.append('category_name', values.category_name);
      }

      if (values.image) {
        formData.append('image', values.image);
      } else if (selectedBook?.image_url && !values.image_url) {
        // This condition means user explicitly removed the image
        // Send a specific indicator to backend to clear the image
        formData.append('clear_image', 'true');
      }

      formData.append('_method', 'PUT'); // Laravel expects this for PUT with FormData

      // The apicall function needs to handle FormData correctly.
      // Assuming it detects FormData and sets 'Content-Type': 'multipart/form-data'
      const response = await apiCall(`/api/admin-books/${selectedBook?.id}`, formData, 'POST', token);
      return response;
    },
    onSuccess: () => {
      toast.success({
        title: 'Book updated successfully!',
        description: 'The book details have been refreshed.',
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['books'] }); // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: ['book', selectedBook?.id] }); // Invalidate single book cache
      // Also invalidate author, publisher, category lists if new ones might have been created
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      // Assuming apicall throws an error object with a 'response.data.message' structure
      toast.error({
        title: 'Failed to update book.',
        description: error.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values) => {
    updateBookMutation.mutate(values);
  };

  // --- Delete Book Mutation ---
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId) => {
      await apiCall(`/api/admin-books/${bookId}`, {}, 'DELETE', token);
    },
    onSuccess: () => {
      toast.success({
        title: 'Book deleted successfully!',
        description: 'The book has been removed from the system.',
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      toast.error({
        title: 'Failed to delete book.',
        description: error.response?.data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteBook = (bookId) => {
    deleteBookMutation.mutate(bookId);
  };

  // --- Event Handlers ---
  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditDialogOpen(true);
  };

  const handleFilterChange = (filterName, value) => {
    if( value === 'all') {
        value = ''; // Convert 'all' to empty string for filtering
    }
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // --- Table Columns ---
  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'publisher',
      header: 'Publisher',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
              Edit
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}> {/* Prevent closing dropdown */}
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the book
                    and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteBook(row.original.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);


  if (isLoadingBooks) {
    return <div className="flex justify-center items-center h-screen"><Loader2 /> Loading books...</div>;
  }

  if (booksError) {
    return <div className="text-red-500">Error loading books: {booksError.message}</div>;
  }

  const books = booksData?.data || [];
  const meta = booksData?.meta;

  const currentImageUrl = form.watch('image_url');
  const selectedImageFile = form.watch('image');


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Search Title</label>
          <Input
            placeholder="Search by title..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="min-w-[150px]">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
          <Select
            value={filters.category_id}
            onValueChange={(value) => handleFilterChange('category_id', value)}
            disabled={isLoadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Publisher</label>
          <Select
            value={filters.publisher_id}
            onValueChange={(value) => handleFilterChange('publisher_id', value)}
            disabled={isLoadingPublishers}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Publisher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Publishers</SelectItem>
              {publishers.map((pub) => (
                <SelectItem key={pub.publisher_id} value={pub.publisher_id}>
                  {pub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[150px]">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Author</label>
          <Select
            value={filters.author_id}
            onValueChange={(value) => handleFilterChange('author_id', value)}
            disabled={isLoadingAuthors}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authors.map((auth) => (
                <SelectItem key={auth.author_id} value={auth.author_id}>
                  {auth.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setFilters({ search: '', category_id: '', publisher_id: '', author_id: '' })}>
          Clear Filters
        </Button>
      </div>

      {/* Books Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.id || String(column.accessorKey)}>
                  {typeof column.header === 'string' ? column.header : ''}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length > 0 ? (
              books.map((book) => (
                <TableRow key={book.book_id}>
                  {columns.map(column => (
                    <TableCell key={column.id || String(column.accessorKey)}>
                       {column.id === 'actions' ? column.cell({ row: { original: book } }): (typeof book[String(column.accessorKey)] === 'object' && book[String(column.accessorKey)] !== null? book[String(column.accessorKey)].name // Access the 'name' property for objects
                        : book[String(column.accessorKey)])
                        || 'N/A' // Fallback for undefined values
                        }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {/* Render pages (simplified for brevity, consider a more advanced pagination component for many pages) */}
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
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
                onClick={() => handlePageChange(Math.min(meta.last_page, currentPage + 1))}
                disabled={currentPage === meta.last_page}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}


      {/* Edit Book Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book: {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author Selector/Creator */}
              <FormField
                control={form.control}
                name="author_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAuthors}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an author" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="">-- Select Existing or Add New --</SelectItem> */}
                        {authors.map((author) => (
                          <SelectItem key={author.author_id} value={author.author_id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!form.watch('author_id') && ( // Only show if no existing author is selected
                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Author Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter new author name if not found above" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Publisher Selector/Creator */}
              <FormField
                control={form.control}
                name="publisher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPublishers}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a publisher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="">-- Select Existing or Add New --</SelectItem> */}
                        {publishers.map((publisher) => (
                          <SelectItem key={publisher.id} value={publisher.id}>
                            {publisher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!form.watch('publisher_id') && ( // Only show if no existing publisher is selected
                <FormField
                  control={form.control}
                  name="publisher_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Publisher Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter new publisher name if not found above" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Category Selector/Creator */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* <SelectItem value="">-- Select Existing or Add New --</SelectItem> */}
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!form.watch('category_id') && ( // Only show if no existing category is selected
                <FormField
                  control={form.control}
                  name="category_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter new category name if not found above" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Book Cover Image</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          onChange(event.target.files && event.target.files[0]);
                          // Clear image_url if new file selected to force re-render/logic
                          form.setValue('image_url', null, { shouldValidate: true });
                        }}
                      />
                    </FormControl>
                    {/* Display current image or selected new image preview */}
                    {(currentImageUrl && !selectedImageFile) && ( // Show current image if no new file selected
                      <div className="mt-2 flex items-center gap-4">
                        <img
                          src={currentImageUrl}
                          alt="Current Book Cover"
                          className="w-32 h-32 object-contain border rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.setValue('image', null, { shouldValidate: true });
                            form.setValue('image_url', null, { shouldValidate: true }); // Explicitly clear for backend
                          }}
                        >
                          Remove Current Image
                        </Button>
                      </div>
                    )}
                    {selectedImageFile && ( // Show preview of newly selected file
                       <div className="mt-2 flex items-center gap-4">
                        <img
                          src={URL.createObjectURL(selectedImageFile)}
                          alt="New Book Cover Preview"
                          className="w-32 h-32 object-contain border rounded"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            form.setValue('image', null, { shouldValidate: true });
                            // Optionally restore original image_url if user cancels new file selection
                            form.setValue('image_url', selectedBook?.image_url || null, { shouldValidate: true });
                          }}
                        >
                          Cancel New Image
                        </Button>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />


              <DialogFooter>
                <Button type="submit" disabled={updateBookMutation.isPending}>
                  {updateBookMutation.isPending ? <Spinner className="mr-2" /> : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateBookMutation.isPending}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BooksPage;