import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button'; // Reusable Button component
import { Input } from '@/components/ui/input'; // Reusable Input component
import { Textarea } from '@/components/ui/textarea'; // Reusable Textarea component
import { buttonGreen } from "@/utils/colors"; // Your custom green color
import { apiCall } from '@/utils/ApiCall'; // Your API utility
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an AuthContext for authentication

const InsertBookForm = () => {
    // --- State Management ---
    const { token } = useAuth(); // Assuming you have a useAuth hook to get the token
    const [formData, setFormData] = useState({
        title: '',
        author: '', // Display name for author
        author_id: null, // UUID for author
        publisher: '', // Display name for publisher
        publisher_id: null, // UUID for publisher
        category: '', // Display name for category
        category_id: null, // UUID for category
        description: '',
        copies_to_add: 1,
        book_id: null, // To store ID of existing book
        is_new_book: true, // Boolean to track if it's a new entry (system-wide)
        image: null, // To store the selected image file object
    });

    const [bookSuggestions, setBookSuggestions] = useState([]);
    const [loadingBookSuggestions, setLoadingBookSuggestions] = useState(false);
    const [activeBookSuggestion, setActiveBookSuggestion] = useState(-1);

    const [authorSuggestions, setAuthorSuggestions] = useState([]);
    const [loadingAuthorSuggestions, setLoadingAuthorSuggestions] = useState(false);
    const [activeAuthorSuggestion, setActiveAuthorSuggestion] = useState(-1);

    const [publisherSuggestions, setPublisherSuggestions] = useState([]);
    const [loadingPublisherSuggestions, setLoadingPublisherSuggestions] = useState(false);
    const [activePublisherSuggestion, setActivePublisherSuggestion] = useState(-1);

    const [categorySuggestions, setCategorySuggestions] = useState([]);
    const [loadingCategorySuggestions, setLoadingCategorySuggestions] = useState(false);
    const [activeCategorySuggestion, setActiveCategorySuggestion] = useState(-1);

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // --- Debounce Refs ---
    const debounceTimeoutRef = useRef(null);
    const authorDebounceTimeoutRef = useRef(null);
    const publisherDebounceTimeoutRef = useRef(null);
    const categoryDebounceTimeoutRef = useRef(null);

    // --- Suggestion List Refs for Click Outside ---
    const bookSuggestionsRef = useRef(null);
    const authorSuggestionsRef = useRef(null);
    const publisherSuggestionsRef = useRef(null);
    const categorySuggestionsRef = useRef(null);

    // --- Debounced API Call Helper ---
    const debounceApiCall = useCallback((query, setSuggestions, setLoading, apiEndpoint, debounceRef, setActiveSuggestion) => {
        if (query.length > 2) {
            setLoading(true);
            setSuggestions([]);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(async () => {
                try {
                    const response = await apiCall(`${apiEndpoint}?search=${query}`, {}, 'GET');
                    if (response.success) {
                        setSuggestions(response.data);
                        setActiveSuggestion(-1); // Reset active suggestion on new search results
                    } else {
                        console.error(`Failed to fetch suggestions from ${apiEndpoint}:`, response.message);
                        setSuggestions([]);
                    }
                } catch (error) {
                    console.error(`Network error fetching suggestions from ${apiEndpoint}:`, error);
                    setSuggestions([]);
                } finally {
                    setLoading(false);
                }
            }, 1500);
        } else {
            setSuggestions([]);
            setLoading(false);
        }
    }, []);

    // --- Effects for Suggestions (Debounced API Calls) ---

    // Effect for Book Title Suggestions
    useEffect(() => {
        // Only fetch suggestions if is_new_book is false to search for existing books
        // If the user types a new title, it's considered a new book, so don't fetch existing suggestions for it
        if (formData.title.length > 2) {
             setLoadingBookSuggestions(true);
             setBookSuggestions([]);
             if (debounceTimeoutRef.current) {
                 clearTimeout(debounceTimeoutRef.current);
             }
             debounceTimeoutRef.current = setTimeout(async () => {
                 try {
                     const response = await apiCall(`/api/books/search?title=${formData.title}`, {}, 'GET');
                     if (response.success) {
                         setBookSuggestions(response.data);
                         setActiveBookSuggestion(-1);
                     } else {
                         console.error('Failed to fetch book suggestions:', response.message);
                         setBookSuggestions([]);
                     }
                 } catch (error) {
                     console.error('Network error fetching book suggestions:', error);
                     setBookSuggestions([]);
                 } finally {
                     setLoadingBookSuggestions(false);
                 }
             }, 1500);
         } else {
             setBookSuggestions([]);
             setLoadingBookSuggestions(false);
         }
    }, [formData.title]);

    // Effect for Author Suggestions
    useEffect(() => {
        debounceApiCall(formData.author, setAuthorSuggestions, setLoadingAuthorSuggestions, '/api/authors', authorDebounceTimeoutRef, setActiveAuthorSuggestion);
    }, [formData.author, debounceApiCall]);

    // Effect for Publisher Suggestions
    useEffect(() => {
        debounceApiCall(formData.publisher, setPublisherSuggestions, setLoadingPublisherSuggestions, '/api/publishers', publisherDebounceTimeoutRef, setActivePublisherSuggestion);
    }, [formData.publisher, debounceApiCall]);

    // Effect for Category Suggestions
    useEffect(() => {
        debounceApiCall(formData.category, setCategorySuggestions, setLoadingCategorySuggestions, '/api/categories', categoryDebounceTimeoutRef, setActiveCategorySuggestion);
    }, [formData.category, debounceApiCall]);

    // --- Click Outside Hook ---
    const useClickOutside = (ref, handler) => {
        useEffect(() => {
            const listener = (event) => {
                if (!ref.current || ref.current.contains(event.target)) {
                    return;
                }
                handler(event);
            };
            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);
            return () => {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
            };
        }, [ref, handler]);
    };

    useClickOutside(bookSuggestionsRef, () => setBookSuggestions([]));
    useClickOutside(authorSuggestionsRef, () => setAuthorSuggestions([]));
    useClickOutside(publisherSuggestionsRef, () => setPublisherSuggestions([]));
    useClickOutside(categorySuggestionsRef, () => setCategorySuggestions([]));

    // --- Event Handlers ---

    // Generic handler for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: value,
                // Reset success/error messages on input change
                formError: null,
                formSuccess: null,
            };

            // If any of these core fields are changed, it implies a new or modified book entry
            if (['title', 'author', 'publisher', 'category'].includes(name)) {
                newState.is_new_book = true;
                newState.book_id = null; // Clear existing book ID
            }

            // Clear specific IDs if their corresponding name field is being typed into
            if (name === 'author') newState.author_id = null;
            if (name === 'publisher') newState.publisher_id = null;
            if (name === 'category') newState.category_id = null;

            return newState;
        });
    };

    // Handler for image file input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            image: file,
            is_new_book: true, // If an image is uploaded, it's definitely a new book or a new version
            book_id: null,
        }));
        setFormError(null);
        setFormSuccess(null);
    };

    // Handler for selecting an existing book from suggestions
    const handleBookSuggestionSelect = (book) => {
        setFormData(prev => ({
            ...prev,
            title: book.title,
            author: book.author_name || '',
            author_id: book.author_id,
            publisher: book.publisher_name || '',
            publisher_id: book.publisher_id,
            category: book.category_name || '',
            category_id: book.category_id,
            description: book.description,
            book_id: book.book_id, // Store the existing book's ID
            is_new_book: false, // Mark as existing book
            image: null, // Clear any selected image, as existing book has its own image_url
        }));
        setBookSuggestions([]); // Clear suggestions after selection
        setActiveBookSuggestion(-1);
    };

    // Handler for selecting an Author suggestion
    const handleAuthorSuggestionSelect = (author) => {
        setFormData(prev => ({
            ...prev,
            author: author.name,
            author_id: author.author_id,
            is_new_book: prev.book_id ? false : true, // If book_id exists, keep it existing, otherwise new
        }));
        setAuthorSuggestions([]);
        setActiveAuthorSuggestion(-1);
    };

    // Handler for selecting a Publisher suggestion
    const handlePublisherSuggestionSelect = (publisher) => {
        setFormData(prev => ({
            ...prev,
            publisher: publisher.name,
            publisher_id: publisher.publisher_id,
            is_new_book: prev.book_id ? false : true, // If book_id exists, keep it existing, otherwise new
        }));
        setPublisherSuggestions([]);
        setActivePublisherSuggestion(-1);
    };

    // Handler for selecting a Category suggestion
    const handleCategorySuggestionSelect = (category) => {
        setFormData(prev => ({
            ...prev,
            category: category.name,
            category_id: category.category_id,
            is_new_book: prev.book_id ? false : true, // If book_id exists, keep it existing, otherwise new
        }));
        setCategorySuggestions([]);
        setActiveCategorySuggestion(-1);
    };

    // --- Keyboard Navigation Handlers ---
    const handleKeyDown = (e, suggestions, activeSuggestion, setActiveSuggestion, handleSelect) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestion(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && activeSuggestion >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeSuggestion]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setBookSuggestions([]); // Assuming this is called from book title input
            setAuthorSuggestions([]);
            setPublisherSuggestions([]);
            setCategorySuggestions([]);
            setActiveSuggestion(-1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        const formDataToSend = new FormData();

        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('copies_to_add', parseInt(formData.copies_to_add, 10));
        formDataToSend.append('is_new_book', formData.is_new_book ? '1' : '0');

        // Conditionally append book_id based on is_new_book
        if (!formData.is_new_book && formData.book_id) {
            formDataToSend.append('book_id', formData.book_id);
        }

        // Conditionally append author/publisher/category IDs or names
        if (formData.author_id) {
            formDataToSend.append('author_id', formData.author_id);
        } else if (formData.author) {
            formDataToSend.append('author_name', formData.author);
        }

        if (formData.publisher_id) {
            formDataToSend.append('publisher_id', formData.publisher_id);
        } else if (formData.publisher) {
            formDataToSend.append('publisher_name', formData.publisher);
        }

        if (formData.category_id) {
            formDataToSend.append('category_id', formData.category_id);
        } else if (formData.category) {
            formDataToSend.append('category_name', formData.category);
        }

        // Append the image file only if it's a new book AND an image is selected
        if (formData.is_new_book && formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            console.log('FormData contents before sending:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            const response = await apiCall('/api/books', formDataToSend, 'POST', token);
            if (response.success) {
                setFormSuccess('Book entry updated successfully!');
                // Reset form fields after successful submission, keep copies_to_add
                setFormData({
                    title: '',
                    author: '',
                    author_id: null,
                    publisher: '',
                    publisher_id: null,
                    category: '',
                    category_id: null,
                    description: '',
                    copies_to_add: 1, // Keep default for next entry
                    book_id: null,
                    is_new_book: true,
                    image: null, // Clear selected image
                });
                // Clear file input manually if it exists
                if (document.getElementById('image')) {
                    document.getElementById('image').value = '';
                }
            } else {
                setFormError(response.message || 'Failed to submit book entry.');
                if (response.errors) {
                    const errorMessages = Object.values(response.errors).flat().join('; ');
                    setFormError(prev => `${prev ? prev + '; ' : ''}Details: ${errorMessages}`);
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormError('Network error or server issue. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Insert/Update Book Copies</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="relative">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, bookSuggestions, activeBookSuggestion, setActiveBookSuggestion, handleBookSuggestionSelect)}
                        placeholder="Enter book title"
                        required
                        className="w-full"
                    />
                    {loadingBookSuggestions && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                    {bookSuggestions.length > 0 && (
                        <ul ref={bookSuggestionsRef} className="bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg z-10 absolute w-full">
                            {bookSuggestions.map((book, index) => (
                                <li
                                    key={book.book_id}
                                    onClick={() => handleBookSuggestionSelect(book)}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 text-gray-800 ${index === activeBookSuggestion ? 'bg-gray-200' : ''}`}
                                >
                                    <p className="font-semibold">{book.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {book.author_name && `Author: ${book.author_name}`}
                                        {book.publisher_name && `, Publisher: ${book.publisher_name}`}
                                        {book.category_name && `, Category: ${book.category_name}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Author */}
                <div className="relative">
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Author <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        name="author"
                        id="author"
                        value={formData.author}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, authorSuggestions, activeAuthorSuggestion, setActiveAuthorSuggestion, handleAuthorSuggestionSelect)}
                        placeholder="Enter author name"
                        required
                        className="w-full"
                    />
                    {loadingAuthorSuggestions && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                    {authorSuggestions.length > 0 && (
                        <ul ref={authorSuggestionsRef} className="bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg z-10 absolute w-full">
                            {authorSuggestions.map((author, index) => (
                                <li
                                    key={author.author_id}
                                    onClick={() => handleAuthorSuggestionSelect(author)}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 text-gray-800 ${index === activeAuthorSuggestion ? 'bg-gray-200' : ''}`}
                                >
                                    {author.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Publisher */}
                <div className="relative">
                    <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
                        Publisher <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        name="publisher"
                        id="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, publisherSuggestions, activePublisherSuggestion, setActivePublisherSuggestion, handlePublisherSuggestionSelect)}
                        placeholder="Enter publisher"
                        required
                        className="w-full"
                    />
                    {loadingPublisherSuggestions && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                    {publisherSuggestions.length > 0 && (
                        <ul ref={publisherSuggestionsRef} className="bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg z-10 absolute w-full">
                            {publisherSuggestions.map((publisher, index) => (
                                <li
                                    key={publisher.publisher_id}
                                    onClick={() => handlePublisherSuggestionSelect(publisher)}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 text-gray-800 ${index === activePublisherSuggestion ? 'bg-gray-200' : ''}`}
                                >
                                    {publisher.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Category */}
                <div className="relative">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, categorySuggestions, activeCategorySuggestion, setActiveCategorySuggestion, handleCategorySuggestionSelect)}
                        placeholder="e.g., Fiction, Science, History"
                        required
                        className="w-full"
                    />
                    {loadingCategorySuggestions && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                    {categorySuggestions.length > 0 && (
                        <ul ref={categorySuggestionsRef} className="bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg z-10 absolute w-full">
                            {categorySuggestions.map((category, index) => (
                                <li
                                    key={category.category_id}
                                    onClick={() => handleCategorySuggestionSelect(category)}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 text-gray-800 ${index === activeCategorySuggestion ? 'bg-gray-200' : ''}`}
                                >
                                    {category.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <Textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter a brief description of the book"
                        rows={4}
                        className="w-full"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                        Book Cover Image (Optional)
                    </label>
                    <Input
                        type="file"
                        name="image"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*" // Restrict to image files
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {formData.image && (
                        <p className="text-sm text-gray-500 mt-1">Selected file: {formData.image.name}</p>
                    )}
                    {!formData.is_new_book && (
                        <p className="text-sm text-gray-500 mt-1">
                            Note: Image upload is only for new book entries. For existing books, the image is managed separately.
                        </p>
                    )}
                </div>

                {/* Copies to Add */}
                <div>
                    <label htmlFor="copies_to_add" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Copies to Add <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="number"
                        name="copies_to_add"
                        id="copies_to_add"
                        value={formData.copies_to_add}
                        onChange={handleChange}
                        min="1"
                        required
                        className="w-full"
                    />
                </div>

                {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
                {formSuccess && <p className="text-green-500 text-sm mt-2">{formSuccess}</p>}

                <Button
                    type="submit"
                    style={{ backgroundColor: buttonGreen }}
                    className="w-full py-3 text-lg font-semibold text-white rounded-md hover:opacity-90 transition-opacity"
                    disabled={formLoading}
                >
                    {formLoading ? 'Submitting...' : (formData.is_new_book ? 'Add New Book & Copies' : 'Add Copies to Existing Book')}
                </Button>
            </form>
        </div>
    );
};

export default InsertBookForm;