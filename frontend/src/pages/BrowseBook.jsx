import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import LibraryBookCard from '@/components/BookCard';

const BrowseBooksPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL; // Ensure this is set in your .env file
  // Ensure apiUrl is defined
  if (!apiUrl) {
    console.error('API URL is not defined. Please set the apiUrl environment variable.');
    return <div className="text-red-500 text-center mt-8">API URL is not defined. Please check your environment variables.</div>;   
  }
  // --- State Management ---
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filter Data (fetched from API)
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [halls, setHalls] = useState([]);

  // Filter Selections (to send to backend)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedHalls, setSelectedHalls] = useState([]);

  // Filter Search Terms (for searching within filter dropdowns)
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [hallSearchTerm, setHallSearchTerm] = useState('');

  // Sort Option
  const [sortOption, setSortOption] = useState({ value: 'recently_added', label: 'Recently Added', order: 'desc' });

  // UI State for dropdowns
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Refs for click-outside detection
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  // --- Sort Options (matching backend values) ---
  const sortOptions = [
    { value: 'recently_added', label: 'Newest First', order: 'desc' },
    { value: 'recently_added', label: 'Oldest First', order: 'asc' },
    { value: 'best_reads', label: 'Most Reads', order: 'desc' },
    { value: 'top_rated', label: 'Highest Rated', order: 'desc' },
  ];

  // --- Helper to determine if a filter is active ---
  const isFilterActive = (filterType, filterId) => {
    switch (filterType) {
      case 'category': return selectedCategories.includes(filterId);
      case 'author': return selectedAuthors.includes(filterId);
      case 'hall': return selectedHalls.includes(filterId);
      default: return false;
    }
  };

  // --- Click Outside Hook ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Fetch Initial Filter Data (Categories, Authors, Halls) ---
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, authorsRes, hallsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/categories`),
          axios.get(`${apiUrl}/api/authors`),
          axios.get(`${apiUrl}/api/halls`),
        ]);
        setCategories(categoriesRes.data);
        setAuthors(authorsRes.data);
        setHalls(hallsRes.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        // Handle error gracefully
      }
    };
    fetchFilterData();
  }, []);

  // --- Fetch Books Function ---
  const fetchBooks = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    const params = {
      page: page,
      sort_by: sortOption.value,
      sort_order: sortOption.order,
    };

    // Add filters to params (assuming backend accepts singular ID for each filter type)
    if (selectedCategories.length > 0) {
      params.category_id = selectedCategories[0]; // Send only the first selected category ID
    }
    if (selectedAuthors.length > 0) {
      params.author_id = selectedAuthors[0]; // Send only the first selected author ID
    }
    if (selectedHalls.length > 0) {
      params.hall_id = selectedHalls[0]; // Send only the first selected hall ID
    }

    try {
      const response = await axios.get(`${apiUrl}/api/books`, { params });
      const { data, meta } = response.data; // Destructure nested response

      if (append) {
        setBooks((prevBooks) => [...prevBooks, ...data]);
      } else {
        setBooks(data);
      }
      setCurrentPage(meta.current_page);
      setTotalPages(meta.last_page);
      setTotalResults(meta.total);

    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sortOption, selectedCategories, selectedAuthors, selectedHalls]); // Dependencies for useCallback

  // --- useEffect for triggering book fetch on filter/sort changes ---
  useEffect(() => {
    fetchBooks(1, false); // Fetch from page 1, don't append (new search)
  }, [fetchBooks]); // Dependency array for useEffect

  // --- Handlers ---
  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortOptions(false);
  };

  const handleFilterToggle = (filterType, filterId) => {
    switch (filterType) {
      case 'category':
        setSelectedCategories((prev) =>
          prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [filterId] // Single select
        );
        break;
      case 'author':
        setSelectedAuthors((prev) =>
          prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [filterId] // Single select
        );
        break;
      case 'hall':
        setSelectedHalls((prev) =>
          prev.includes(filterId) ? prev.filter((id) => id !== filterId) : [filterId] // Single select
        );
        break;
      default:
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedAuthors([]);
    setSelectedHalls([]);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchBooks(currentPage + 1, true); // Fetch next page and append
    }
  };

  // --- Filtered lists for display within dropdowns ---
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );
  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(authorSearchTerm.toLowerCase())
  );
  const filteredHalls = halls.filter(hall =>
    hall.name.toLowerCase().includes(hallSearchTerm.toLowerCase())
  );

  // --- Get active filter labels for display ---
  const getActiveFilterLabels = () => {
    const labels = [];
    if (selectedCategories.length > 0) {
      const cat = categories.find(c => c.category_id === selectedCategories[0]);
      if (cat) labels.push(cat.name);
    }
    if (selectedAuthors.length > 0) {
      const author = authors.find(a => a.author_id === selectedAuthors[0]);
      if (author) labels.push(author.name);
    }
    if (selectedHalls.length > 0) {
      const hall = halls.find(h => h.hall_id === selectedHalls[0]);
      if (hall) labels.push(hall.name);
    }
    return labels;
  };

  const activeFilterLabels = getActiveFilterLabels();

  // --- Rendered Component ---
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 max-w-7xl mx-auto"> {/* Added max-w-7xl mx-auto for content width */}
        {/* Back button and page title */}
        <div className="flex items-center mb-4">
          <button className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Browse Books</h1> {/* Increased title size */}
        </div>

        {/* Filter controls */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2"> {/* Added flex-wrap gap-2 for mobile */}
          <div className="text-sm text-gray-600">{totalResults} results found</div>

          <div className="flex space-x-2">
            {/* Sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort ({sortOption.label})
              </button>

              {showSortOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <ul className="py-1">
                    {sortOptions.map(option => (
                      <li key={option.value + option.order}>
                        <button
                          onClick={() => handleSortChange(option)}
                          className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                            sortOption.value === option.value && sortOption.order === option.order ? 'bg-gray-100 font-semibold' : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium border border-gray-300 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter ({activeFilterLabels.length})
              </button>

              {showFilterOptions && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 lg:w-96 bg-white rounded-md shadow-lg z-50 p-4 ring-1 ring-black ring-opacity-5 focus:outline-none"> {/* Increased width */}
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Filter by</h3>

                  {/* Categories Filter */}
                  <div className="mb-4 border-b pb-4 border-gray-200">
                    <h4 className="text-base font-medium mb-2 text-gray-700">Tags (Category)</h4>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                    />
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar */}
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <div key={category.category_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`category-${category.category_id}`}
                              checked={isFilterActive('category', category.category_id)}
                              onChange={() => handleFilterToggle('category', category.category_id)}
                              className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor={`category-${category.category_id}`} className="ml-2 text-sm text-gray-700">
                              {category.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No categories found.</p>
                      )}
                    </div>
                  </div>

                  {/* Authors Filter */}
                  <div className="mb-4 border-b pb-4 border-gray-200">
                    <h4 className="text-base font-medium mb-2 text-gray-700">Authors</h4>
                    <input
                      type="text"
                      placeholder="Search authors..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
                      value={authorSearchTerm}
                      onChange={(e) => setAuthorSearchTerm(e.target.value)}
                    />
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar */}
                      {filteredAuthors.length > 0 ? (
                        filteredAuthors.map((author) => (
                          <div key={author.author_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`author-${author.author_id}`}
                              checked={isFilterActive('author', author.author_id)}
                              onChange={() => handleFilterToggle('author', author.author_id)}
                              className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor={`author-${author.author_id}`} className="ml-2 text-sm text-gray-700">
                              {author.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No authors found.</p>
                      )}
                    </div>
                  </div>

                  {/* Availability (Halls) Filter */}
                  <div className="mb-4">
                    <h4 className="text-base font-medium mb-2 text-gray-700">Availability (Halls)</h4>
                    <input
                      type="text"
                      placeholder="Search halls..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 mb-2"
                      value={hallSearchTerm}
                      onChange={(e) => setHallSearchTerm(e.target.value)}
                    />
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar */}
                      {filteredHalls.length > 0 ? (
                        filteredHalls.map((hall) => (
                          <div key={hall.hall_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`hall-${hall.hall_id}`}
                              checked={isFilterActive('hall', hall.hall_id)}
                              onChange={() => handleFilterToggle('hall', hall.hall_id)}
                              className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                            />
                            <label htmlFor={`hall-${hall.hall_id}`} className="ml-2 text-sm text-gray-700">
                              {hall.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No halls found.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClearAllFilters}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowFilterOptions(false)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterLabels.map((label, index) => (
              <div key={index} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
                {label}
                <button
                  onClick={() => {
                    // Logic to remove filter by label (more complex, but needed)
                    // For simplicity with single-select backend, we clear all filters here
                    // or match the label back to the ID to remove specific one.
                    const categoryToRemove = categories.find(c => c.name === label);
                    if (categoryToRemove) handleFilterToggle('category', categoryToRemove.category_id);
                    const authorToRemove = authors.find(a => a.name === label);
                    if (authorToRemove) handleFilterToggle('author', authorToRemove.author_id);
                    const hallToRemove = halls.find(h => h.name === label);
                    if (hallToRemove) handleFilterToggle('hall', hallToRemove.hall_id);

                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={handleClearAllFilters}
              className="text-red-600 text-sm px-3 py-1 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading and Error states */}
        {loading && books.length === 0 && <p className="text-center text-gray-700 py-8">Loading books...</p>}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}
        {!loading && books.length === 0 && !error && <p className="text-center text-gray-700 py-8">No books found matching your criteria.</p>}

        {/* Book grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* Increased gap */}
          {books.map(book => (
            <LibraryBookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              rating={book.rating}
              ratingCount={book.ratingCount}
              isLoved={book.isLoved}
              availableStatus={book.availableStatus}
              tags={book.tags}
              imageUrl={book.imageUrl}
            />
          ))}
        </div>

        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out"
              disabled={loading}
            >
              {loading && books.length > 0 ? 'Loading more...' : 'Load More'}
            </button>
          </div>
        )}
        {loading && books.length > 0 && (
            <p className="text-center text-gray-500 mt-4">Loading more books...</p>
        )}
      </div>
       {/* Custom Scrollbar Styles (add to your CSS file or directly here if using styled-components/emotion) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default BrowseBooksPage;