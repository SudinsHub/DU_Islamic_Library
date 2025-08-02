import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import axios from 'axios';

// ---
// Book Form Dialog
// ---
const BookFormDialog = ({
  book,
  onSuccess,
  isOpen,
  onOpenChange,
  categories,
  authors,
  publishers,
}) => {
  const { token } = useAuth();

  const form = useForm({
    defaultValues: {
      title: book?.title || '',
      description: book?.description || '',
      image_url: book?.image_url || '',
      // For existing book, set the ID. For new, or if selecting 'new', it will be the typed string.
      author: book?.author?.author_id || '',
      publisher: book?.publisher?.publisher_id || '',
      category: book?.category?.category_id || '',
    },
  });

  // State to hold the display value for author, publisher, category input
  // This helps differentiate between typed new entries and selected existing ones
  const [authorInput, setAuthorInput] = useState('');
  const [publisherInput, setPublisherInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title,
        description: book.description,
        image_url: book.image_url,
        author: book.author?.author_id || '', // Set ID for existing
        publisher: book.publisher?.publisher_id || '',
        category: book.category?.category_id || '',
      });
      // Set display values for existing book to their names
      setAuthorInput(book.author?.name || '');
      setPublisherInput(book.publisher?.name || '');
      setCategoryInput(book.category?.name || '');
    } else {
      form.reset({
        title: '',
        description: '',
        image_url: '',
        author: '',
        publisher: '',
        category: '',
      });
      // Clear display values for new book
      setAuthorInput('');
      setPublisherInput('');
      setCategoryInput('');
    }
  }, [book, form, isOpen]);

  const onSubmit = async (values) => {
    try {
      if (!token) {
        toast.error("Authentication token is missing.");
        return;
      }

      const payload = {
        title: values.title,
        description: values.description,
        image_url: values.image_url,
        // The backend handles whether 'author', 'publisher', 'category' is an ID or a new name.
        // So, we just send the value from the form field (which is updated by both select and input).
        author: values.author,
        publisher: values.publisher,
        category: values.category,
      };

      const baseUrl = import.meta.env.VITE_API_URL || '';
      if (book) {
        // Update book
        await axios.put(`${baseUrl}/api/admin-book/${book.book_id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success("Book updated successfully!");
      } else {
        // Add new book
        await axios.post(`${baseUrl}/api/admin-book`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success("Book added successfully!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Book form submission error:", error);
      // Check for validation errors from Laravel backend
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error(error.message || "Failed to save book.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-full">
        <DialogHeader>
          <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {book ? 'Edit the details of this book.' : 'Add a new book to the library.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author Field */}
            <FormItem>
              <FormLabel>Author</FormLabel>
              <Select
                onValueChange={(value) => {
                  form.setValue('author', value);
                  const selectedAuthor = authors.find(a => a.author_id === value);
                  setAuthorInput(selectedAuthor ? selectedAuthor.name : value); // Set display name
                }}
                value={form.watch('author')} // Watch the form value
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an author" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.author_id} value={author.author_id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type a new author name"
                value={authorInput}
                onChange={(e) => {
                  setAuthorInput(e.target.value);
                  form.setValue('author', e.target.value); // Set the form field value to the typed name
                }}
                className="mt-2"
              />
              <FormMessage />
            </FormItem>

            {/* Publisher Field */}
            <FormItem>
              <FormLabel>Publisher</FormLabel>
              <Select
                onValueChange={(value) => {
                  form.setValue('publisher', value);
                  const selectedPublisher = publishers.find(p => p.publisher_id === value);
                  setPublisherInput(selectedPublisher ? selectedPublisher.name : value);
                }}
                value={form.watch('publisher')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a publisher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {publishers.map((publisher) => (
                    <SelectItem key={publisher.publisher_id} value={publisher.publisher_id}>
                      {publisher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type a new publisher name"
                value={publisherInput}
                onChange={(e) => {
                  setPublisherInput(e.target.value);
                  form.setValue('publisher', e.target.value);
                }}
                className="mt-2"
              />
              <FormMessage />
            </FormItem>

            {/* Category Field */}
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  form.setValue('category', value);
                  const selectedCategory = categories.find(c => c.category_id === value);
                  setCategoryInput(selectedCategory ? selectedCategory.name : value);
                }}
                value={form.watch('category')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.category_id} value={category.category_id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type a new category name"
                value={categoryInput}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  form.setValue('category', e.target.value);
                }}
                className="mt-2"
              />
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button type="submit">{book ? 'Save changes' : 'Add Book'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ---
// Inventory Management Dialog
// ---
const InventoryDialog = ({
  book,
  onSuccess,
  isOpen,
  onOpenChange,
  halls,
}) => {
  const { token } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (book && isOpen) {
        setLoading(true);
        try {
          if (!token) throw new Error("Authentication token missing.");
          const baseUrl = import.meta.env.VITE_API_URL || '';
          const response = await axios.get(`${baseUrl}/api/admin-book/${book.book_id}/collections`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = response.data;

          const initialCollections = halls.map(hall => {
            const existing = data.find(col => col.hall_id === hall.hall_id);
            return existing ? existing : {
              collection_id: '', // Will be generated by backend if new
              book_id: book.book_id,
              hall_id: hall.hall_id,
              hall: hall, // Include hall object for display
              available_copies: 0,
              total_copies: 0,
              created_at: '',
              updated_at: '',
            };
          });
          setCollections(initialCollections);
        } catch (error) {
          console.error("Failed to fetch book collections:", error);
          toast.error(error.message || "Failed to fetch book collections.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCollections();
  }, [book, isOpen, token, halls]);

  const handleCollectionChange = (
    index,
    field,
    value
  ) => {
    const newCollections = [...collections];
    newCollections[index] = {
      ...newCollections[index],
      [field]: parseInt(value) || 0,
    };
    setCollections(newCollections);
  };

  const handleSaveInventory = async () => {
    try {
      if (!book || !token) {
        toast.error("Book or authentication token missing.");
        return;
      }

      const payload = {
        book_collection: collections.map(col => ({
          collection_id: col.collection_id || null, // Send null for new collections
          hall_id: col.hall_id,
          available_copies: col.available_copies,
          total_copies: col.total_copies,
        })),
      };

      const baseUrl = import.meta.env.VITE_API_URL || '';
      await axios.put(`${baseUrl}/api/admin-book/${book.book_id}/collections`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success("Inventory updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update inventory:", error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error(error.message || "Failed to update inventory.");
      }
    }
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-[700px] overflow-y-scroll max-h-dvh">
        <DialogHeader>
          <DialogTitle>Manage Inventory for "{book.title}"</DialogTitle>
          <DialogDescription>
            Adjust the number of copies available in different halls.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div>Loading inventory...</div>
        ) : (
          <div className="grid gap-4 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hall</TableHead>
                  <TableHead>Available Copies</TableHead>
                  <TableHead>Total Copies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((col, index) => (
                  <TableRow key={col.hall.hall_id}>
                    <TableCell>{col.hall.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={col.available_copies}
                        onChange={(e) => handleCollectionChange(index, 'available_copies', e.target.value)}
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={col.total_copies}
                        onChange={(e) => handleCollectionChange(index, 'total_copies', e.target.value)}
                        min="0"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleSaveInventory} disabled={loading}>Save Inventory</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---
// Main Admin Book Management Page
// ---
const AdminBookManagementPage = () => {
  const { token } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filter states
  const [filterTitle, setFilterTitle] = useState('');
  const [filterHall, setFilterHall] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Dialog states
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [managingBook, setManagingBook] = useState(null);


  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      if (!token) throw new Error("Authentication token missing.");

      const params = {
        page: page,
        ...(filterTitle && { title: filterTitle }),
        ...(filterHall && { hall_id: filterHall }),
        ...(filterAuthor && { author_id: filterAuthor }),
        ...(filterPublisher && { publisher_id: filterPublisher }),
        ...(filterCategory && { category_id: filterCategory }),
      };

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${baseUrl}/api/admin-book`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: params,
      });
      setBooks(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error(error.message || "Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  }, [token, filterTitle, filterHall, filterAuthor, filterPublisher, filterCategory]);

  const fetchDependencies = useCallback(async () => {
    try {
      if (!token) throw new Error("Authentication token missing.");
      const baseUrl = import.meta.env.VITE_API_URL || '';

      const [categoriesResponse, authorsResponse, publishersResponse, hallsResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/authors`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/publishers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get(`${baseUrl}/api/halls`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      setCategories(categoriesResponse.data);
      setAuthors(authorsResponse.data);
      setPublishers(publishersResponse.data);
      setHalls(hallsResponse.data);
    } catch (error) {
      console.error("Failed to fetch dependencies:", error);
      toast.error(error.message || "Failed to fetch dependencies (categories, authors, etc.).");
    }
  }, [token]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    console.log("Fetching books again. Page no:", currentPage);
    fetchBooks(currentPage);
  }, [fetchBooks, currentPage]);


  const handleAddBookClick = () => {
    setEditingBook(null);
    setIsBookFormOpen(true);
  };

  const handleEditBookClick = (book) => {
    setEditingBook(book);
    setIsBookFormOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book? This will also delete all its inventory records.')) {
      return;
    }
    try {
      if (!token) throw new Error("Authentication token missing.");
      const baseUrl = import.meta.env.VITE_API_URL || '';
      await axios.delete(`${baseUrl}/api/admin-book/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      toast.success("Book deleted successfully!");
      fetchBooks(currentPage);
    } catch (error) {
      console.error("Failed to delete book:", error);
      toast.error(error.message || "Failed to delete book.");
    }
  };

  const handleManageInventoryClick = (book) => {
    setManagingBook(book);
    setIsInventoryDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <Input
          placeholder="Filter by Title"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        />
        <Select value={filterHall} onValueChange={setFilterHall}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Hall" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Halls</SelectItem> Option to clear filter */}
            {halls.map((hall) => (
              <SelectItem key={hall.hall_id} value={hall.hall_id}>
                {hall.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAuthor} onValueChange={setFilterAuthor}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Author" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Authors</SelectItem> Option to clear filter */}
            {authors.map((author) => (
              <SelectItem key={author.author_id} value={author.author_id}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPublisher} onValueChange={setFilterPublisher}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Publisher" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Publishers</SelectItem> Option to clear filter */}
            {publishers.map((publisher) => (
              <SelectItem key={publisher.publisher_id} value={publisher.publisher_id}>
                {publisher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="">All Categories</SelectItem> Option to clear filter */}
            {categories.map((category) => (
              <SelectItem key={category.category_id} value={category.category_id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => fetchBooks(1)} className="col-span-full md:col-span-1">Apply Filters</Button>
        <Button variant="outline" onClick={() => {
          setFilterTitle('');
          setFilterHall('');
          setFilterAuthor('');
          setFilterPublisher('');
          setFilterCategory('');
          fetchBooks(1);
        }} className="col-span-full md:col-span-1">Reset Filters</Button>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddBookClick}>Add New Book</Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading books...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.length > 0 ? (
                  books.map((book) => (
                    <TableRow key={book.book_id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author?.name || 'N/A'}</TableCell>
                      <TableCell>{book.publisher?.name || 'N/A'}</TableCell>
                      <TableCell>{book.category?.name || 'N/A'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditBookClick(book)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleManageInventoryClick(book)}>Manage Inventory</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBook(book.book_id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No books found.
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

      <BookFormDialog
        book={editingBook}
        onSuccess={() => fetchBooks(currentPage)}
        isOpen={isBookFormOpen}
        onOpenChange={setIsBookFormOpen}
        categories={categories}
        authors={authors}
        publishers={publishers}
      />

      <InventoryDialog
        book={managingBook}
        onSuccess={() => fetchBooks(currentPage)}
        isOpen={isInventoryDialogOpen}
        onOpenChange={setIsInventoryDialogOpen}
        halls={halls}
      />
    </div>
  );
};

export default AdminBookManagementPage;