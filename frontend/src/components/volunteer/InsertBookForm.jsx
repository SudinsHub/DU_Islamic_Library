import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button'; // Reusable Button component
import { Input } from '@/components/ui/input'; // Reusable Input component
import { Textarea } from '@/components/ui/textarea'; // Reusable Textarea component
import { buttonGreen } from "@/utils/colors"; // Your custom green color
import { apiCall } from '@/utils/ApiCall'; // Your API utility
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have an AuthContext for authentication
import { ChevronDown, Loader2, X } from 'lucide-react'; // Example icons from lucide-react (assuming available)

// --- Helper component to simulate a Dropdown Menu/Combobox for selecting an existing entity ---
// In a real application, you would use a Combobox or Select from shadcn/ui
const SelectExistingEntity = ({
    label,
    placeholder,
    value,
    setValue,
    setId,
    options,
    open,
    setOpen,
    idKey, // 'author_id', 'publisher_id', 'category_id'
    nameKey, // 'name' for Author/Publisher/Category object
}) => {
    const ref = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [setOpen]);

    const handleSelect = (option) => {
        setValue(option[nameKey]);
        setId(option[idKey]);
        setOpen(false);
    };
    
    const handleClear = (e) => {
        e.stopPropagation();
        setValue('');
        setId(null);
        setOpen(false);
    }

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Existing {label}
            </label>
            <div className="flex items-center space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                    className="w-full justify-between border border-input h-10 px-3 py-2 bg-white text-left font-normal"
                >
                    {value ? value : placeholder}
                    <div className="flex items-center">
                        {value && (
                            <X className="mr-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100" onClick={handleClear} />
                        )}
                        <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`} />
                    </div>
                </Button>
            </div>
            {open && options.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option[idKey]}
                            onClick={() => handleSelect(option)}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${value === option[nameKey] ? 'bg-gray-100 font-medium' : ''}`}
                        >
                            {option[nameKey]}
                        </div>
                    ))}
                </div>
            )}
            {open && options.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-sm text-gray-500">
                    No saved {label.toLowerCase()}s found.
                </div>
            )}
        </div>
    );
};

const InsertBookForm = () => {
    // --- State Management ---
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        author: '', // Display name for author
        author_id: null, // UUID for author
        new_author_name: '', // New field for new entry
        publisher: '', // Display name for publisher
        publisher_id: null, // UUID for publisher
        new_publisher_name: '', // New field for new entry
        category: '', // Display name for category
        category_id: null, // UUID for category
        new_category_name: '', // New field for new entry
        description: '',
        copies_to_add: 1,
        book_id: null,
        is_new_book: true,
        image: null,
    });

    // --- New States for All Saved Entities (No Search) ---
    const [allAuthors, setAllAuthors] = useState([]);
    const [allPublishers, setAllPublishers] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loadingEntities, setLoadingEntities] = useState(false);

    // --- State for Dropdown Open/Close (Replacing Search Suggestions) ---
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
    const [isPublisherDropdownOpen, setIsPublisherDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    // Existing Book Title Search State (Kept as is)
    const [bookSuggestions, setBookSuggestions] = useState([]);
    const [loadingBookSuggestions, setLoadingBookSuggestions] = useState(false);
    const [activeBookSuggestion, setActiveBookSuggestion] = useState(-1);
    const bookSuggestionsRef = useRef(null);
    
    // --- Form Status States ---
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // --- Helper function for fetching all entities (no search query) ---
    const getAllEntities = useCallback(async (apiEndpoint, setEntities, entityName) => {
        setLoadingEntities(true);
        try {
            // NOTE: apiCall is modified to omit the 'search' query parameter entirely.
            const response = await apiCall(apiEndpoint, {}, 'GET'); 
            if (response.success) {
                // Assuming the backend returns an array of objects
                // e.g., [{ author_id: uuid, name: 'Author Name' }, ...]
                setEntities(response.data);
            } else {
                console.error(`Failed to fetch all ${entityName}:`, response.message);
                setEntities([]);
            }
        } catch (error) {
            console.error(`Network error fetching all ${entityName}:`, error);
            setEntities([]);
        } finally {
            setLoadingEntities(false);
        }
    }, []);

    // --- Effect to fetch all entities on component mount ---
    useEffect(() => {
        // Fetch all authors
        getAllEntities('/api/authors', setAllAuthors, 'authors');
        // Fetch all publishers
        getAllEntities('/api/publishers', setAllPublishers, 'publishers');
        // Fetch all categories
        getAllEntities('/api/categories', setAllCategories, 'categories');
    }, [getAllEntities]);


    // --- Cleanup unused states/refs from the original code ---
    // The previous state and logic for authorSuggestions, publisherSuggestions,
    // categorySuggestions, loadingAuthorSuggestions, etc., are no longer needed 
    // for existing entities, but I'll leave the original structure of the 
    // existing component untouched where possible, only modifying the relevant parts.
    // The original `debounceApiCall` for Author/Publisher/Category is now obsolete
    // for selecting existing ones, but the `useEffect` hooks that call them are now
    // removed/commented out to stop the search behavior.

    // The original `useEffect` hooks for Author/Publisher/Category Suggestions are now OBSOLETE 
    // as they used a search debounce. They are replaced by the fetch-all effect above.
    /*
    // Effect for Author Suggestions (DISABLED/REPLACED)
    useEffect(() => {
        // Original logic was here
    }, [formData.author, debounceApiCall]);

    // Effect for Publisher Suggestions (DISABLED/REPLACED)
    useEffect(() => {
        // Original logic was here
    }, [formData.publisher, debounceApiCall]);

    // Effect for Category Suggestions (DISABLED/REPLACED)
    useEffect(() => {
        // Original logic was here
    }, [formData.category, debounceApiCall]);
    */


    // --- Click Outside Hook (Keep only for Book Suggestions) ---
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

    // Keep only for book suggestions (the only one that still uses real-time search)
    useClickOutside(bookSuggestionsRef, () => setBookSuggestions([]));
    // The previous useClickOutside hooks for A/P/C suggestions are removed/obsolete.


    // --- Event Handlers ---

    // Generic handler for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: value,
                formError: null,
                formSuccess: null,
            };

            // If the user types in the main title, it's a new search or book
            if (name === 'title') {
                newState.is_new_book = true;
                newState.book_id = null;
            }

            // If the user types in a NEW Author/Publisher/Category name input, 
            // we must clear the corresponding SELECTED ID and NAME to prioritize the new entry
            if (name === 'new_author_name') {
                newState.author_id = null;
                newState.author = '';
            } else if (name === 'new_publisher_name') {
                newState.publisher_id = null;
                newState.publisher = '';
            } else if (name === 'new_category_name') {
                newState.category_id = null;
                newState.category = '';
            } else if (['author', 'publisher', 'category'].includes(name)) {
                 // For the old A/P/C inputs (now handled by SelectExistingEntity) 
                 // we maintain the logic to clear IDs, although these inputs are conceptually 
                 // now part of the SelectExistingEntity component where selections directly 
                 // set ID and Name.
                if (name === 'author') newState.author_id = null;
                if (name === 'publisher') newState.publisher_id = null;
                if (name === 'category') newState.category_id = null;
            }
            
            // Mark as new book if any core field is changed
            if (['title', 'new_author_name', 'new_publisher_name', 'new_category_name'].includes(name)) {
                newState.is_new_book = true;
                newState.book_id = null;
            }

            return newState;
        });
    };

    // Handler for image file input (unchanged)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            image: file,
            is_new_book: true,
            book_id: null,
        }));
        setFormError(null);
        setFormSuccess(null);
    };

    // Handler for selecting an existing book from suggestions (unchanged)
    const handleBookSuggestionSelect = (book) => {
        setFormData(prev => ({
            ...prev,
            title: book.title,
            // Auto-populate the selected/existing fields
            author: book.author_name || '',
            author_id: book.author_id,
            // Also clear the new_* fields when an existing book is selected
            new_author_name: '', 
            publisher: book.publisher_name || '',
            publisher_id: book.publisher_id,
            new_publisher_name: '',
            category: book.category_name || '',
            category_id: book.category_id,
            new_category_name: '',
            
            description: book.description,
            book_id: book.book_id,
            is_new_book: false,
            image: null,
        }));
        setBookSuggestions([]);
        setActiveBookSuggestion(-1);
    };

    // Handler for setting an existing Author (used by SelectExistingEntity)
    const handleAuthorSelect = (name, id) => {
        setFormData(prev => ({
            ...prev,
            author: name,
            author_id: id,
            new_author_name: '', // Clear new entry field
            is_new_book: prev.book_id ? false : true,
        }));
        setIsAuthorDropdownOpen(false);
    };
    
    // Handler for setting an existing Publisher (used by SelectExistingEntity)
    const handlePublisherSelect = (name, id) => {
        setFormData(prev => ({
            ...prev,
            publisher: name,
            publisher_id: id,
            new_publisher_name: '', // Clear new entry field
            is_new_book: prev.book_id ? false : true,
        }));
        setIsPublisherDropdownOpen(false);
    };

    // Handler for setting an existing Category (used by SelectExistingEntity)
    const handleCategorySelect = (name, id) => {
        setFormData(prev => ({
            ...prev,
            category: name,
            category_id: id,
            new_category_name: '', // Clear new entry field
            is_new_book: prev.book_id ? false : true,
        }));
        setIsCategoryDropdownOpen(false);
    };

    // --- Keyboard Navigation Handlers (Only for Book Title Search) ---
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
            setBookSuggestions([]); 
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
        
        // Determine is_new_book based on existence of book_id or presence of new metadata
        let is_new_book = formData.is_new_book;

        if (formData.book_id && 
            !formData.new_author_name && !formData.new_publisher_name && !formData.new_category_name && 
            !formData.image) {
            // If an existing book is selected AND no new metadata is provided, it's an existing book update
            is_new_book = false;
        } else if (formData.book_id && (formData.new_author_name || formData.new_publisher_name || formData.new_category_name || formData.image)) {
            // If an existing book is selected BUT new metadata (A/P/C name or Image) is provided, 
            // the backend must treat this as creating a *new book entry* (new version/edition)
            is_new_book = true;
        } else if (!formData.book_id) {
            // If no existing book was selected, it's a new book
            is_new_book = true;
        }

        formDataToSend.append('is_new_book', is_new_book ? '1' : '0');


        // Conditionally append book_id based on is_new_book
        if (!is_new_book && formData.book_id) {
            formDataToSend.append('book_id', formData.book_id);
        }

        // --- New Logic for A/P/C: Prioritize new_* input over ID, then ID over main name ---

        // Author Logic: 1. New name, 2. Existing ID, 3. Existing name (fall through from selection)
        if (formData.new_author_name) {
            formDataToSend.append('author_name', formData.new_author_name);
        } else if (formData.author_id) {
            formDataToSend.append('author_id', formData.author_id);
        } else if (formData.author) {
             // Fallback to name if it's auto-filled but no ID was explicitly selected (e.g., from an existing book)
             formDataToSend.append('author_name', formData.author);
        }

        // Publisher Logic
        if (formData.new_publisher_name) {
            formDataToSend.append('publisher_name', formData.new_publisher_name);
        } else if (formData.publisher_id) {
            formDataToSend.append('publisher_id', formData.publisher_id);
        } else if (formData.publisher) {
             formDataToSend.append('publisher_name', formData.publisher);
        }

        // Category Logic
        if (formData.new_category_name) {
            formDataToSend.append('category_name', formData.new_category_name);
        } else if (formData.category_id) {
            formDataToSend.append('category_id', formData.category_id);
        } else if (formData.category) {
            formDataToSend.append('category_name', formData.category);
        }

        // Append the image file only if it's a new book AND an image is selected
        if (is_new_book && formData.image) {
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
                // Reset all fields, keep copies_to_add default
                setFormData({
                    title: '',
                    author: '',
                    author_id: null,
                    new_author_name: '', 
                    publisher: '',
                    publisher_id: null,
                    new_publisher_name: '',
                    category: '',
                    category_id: null,
                    new_category_name: '',
                    description: '',
                    copies_to_add: 1, 
                    book_id: null,
                    is_new_book: true,
                    image: null,
                });
                // Clear file input manually
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
                {/* Title (Search/Autocomplete - UNCHANGED) */}
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
                
                {/* --- Author Fields (MODIFIED) --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author <span className="text-red-500">*</span>
                    </label>
                    {loadingEntities ? (
                        <div className="flex items-center text-gray-500">
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading authors...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* 1. Existing Author Dropdown */}
                            <SelectExistingEntity
                                label="Author"
                                placeholder="Select an author"
                                value={formData.author}
                                setValue={(name) => handleAuthorSelect(name, formData.author_id)}
                                setId={(id) => handleAuthorSelect(formData.author, id)}
                                options={allAuthors}
                                open={isAuthorDropdownOpen}
                                setOpen={setIsAuthorDropdownOpen}
                                fieldKey="author"
                                idKey="author_id"
                                nameKey="name"
                            />
                            
                            {/* 2. New Author Input */}
                            <div>
                                <label htmlFor="new_author_name" className="block text-xs font-medium text-gray-500 mt-2 mb-1">
                                    OR type a new author name (will override selection)
                                </label>
                                <Input
                                    type="text"
                                    name="new_author_name"
                                    id="new_author_name"
                                    value={formData.new_author_name}
                                    onChange={handleChange}
                                    placeholder="Type a new author name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Publisher Fields (MODIFIED) --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publisher <span className="text-red-500">*</span>
                    </label>
                    {loadingEntities ? (
                        <div className="flex items-center text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading publishers...
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {/* 1. Existing Publisher Dropdown */}
                            <SelectExistingEntity
                                label="Publisher"
                                placeholder="Select a publisher"
                                value={formData.publisher}
                                setValue={(name) => handlePublisherSelect(name, formData.publisher_id)}
                                setId={(id) => handlePublisherSelect(formData.publisher, id)}
                                options={allPublishers}
                                open={isPublisherDropdownOpen}
                                setOpen={setIsPublisherDropdownOpen}
                                fieldKey="publisher"
                                idKey="publisher_id"
                                nameKey="name"
                            />

                             {/* 2. New Publisher Input */}
                            <div>
                                <label htmlFor="new_publisher_name" className="block text-xs font-medium text-gray-500 mt-2 mb-1">
                                    OR type a new publisher name (will override selection)
                                </label>
                                <Input
                                    type="text"
                                    name="new_publisher_name"
                                    id="new_publisher_name"
                                    value={formData.new_publisher_name}
                                    onChange={handleChange}
                                    placeholder="Type a new publisher name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Category Fields (MODIFIED) --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    {loadingEntities ? (
                        <div className="flex items-center text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading categories...
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {/* 1. Existing Category Dropdown */}
                            <SelectExistingEntity
                                label="Category"
                                placeholder="Select a category"
                                value={formData.category}
                                setValue={(name) => handleCategorySelect(name, formData.category_id)}
                                setId={(id) => handleCategorySelect(formData.category, id)}
                                options={allCategories}
                                open={isCategoryDropdownOpen}
                                setOpen={setIsCategoryDropdownOpen}
                                fieldKey="category"
                                idKey="category_id"
                                nameKey="name"
                            />
                            
                             {/* 2. New Category Input */}
                            <div>
                                <label htmlFor="new_category_name" className="block text-xs font-medium text-gray-500 mt-2 mb-1">
                                    OR type a new category name (will override selection)
                                </label>
                                <Input
                                    type="text"
                                    name="new_category_name"
                                    id="new_category_name"
                                    value={formData.new_category_name}
                                    onChange={handleChange}
                                    placeholder="Type a new category name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Description (UNCHANGED) */}
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

                {/* Image Upload (UNCHANGED) */}
                <div>
                    <label htmlFor="image" className="flex flex-col block text-sm font-medium text-gray-700 mb-1">
                        Book Cover Image
                        <span className="text-gray-500 text-xs font-normal">Max 2MB, upload image only if it is a new book for the system.</span>
                    </label>
                    <Input
                        type="file"
                        name="image"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*"
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

                {/* Copies to Add (UNCHANGED) */}
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