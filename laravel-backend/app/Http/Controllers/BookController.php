<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreBookRequest;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateBookRequest;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request; // Added for isLoved user context
use Illuminate\Support\Str;
use App\Models\BookCollection;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * Display a listing of the unique books, tailored for the LibraryBookCard component.
     * This method aggregates availability across all halls for each book.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::query();
    
        // Eager load necessary relationships for data transformation
        // 'author' and 'category' are for direct properties
        // 'book_collection' is for calculating total available copies
        $query->with(['author', 'category', 'book_collection']);
    
        // Add aggregations for sorting and card display without loading full collections
        // 'review_avg_rating' and 'requests_count' will be added as properties to each Book model
        $query->withAvg('review', 'rating') // Adds 'review_avg_rating' property
              ->withCount('request'); // Adds 'requests_count' property
    
        // --- Searching ---
        if ($request->has('search') && !empty($request->input('search'))) { 
            $searchTerm = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('books.title', 'like', $searchTerm)
                    ->orWhereHas('author', function ($authorQuery) use ($searchTerm) {
                        $authorQuery->where('name', 'like', $searchTerm);
                    });
            });
        }
    
        // --- Filtering ---
        // Filter by Hall (book_collections.available_copies > 0 in a specific hall)
        if ($request->has('hall_id') && !empty($request->input('hall_id'))) {
            $hallId = $request->input('hall_id');
            $query->whereHas('book_collection', function ($collectionQuery) use ($hallId) {
                $collectionQuery->where('hall_id', $hallId)->where('available_copies', '>', 0);
            });
        }
    
        // Filter by Category
        if ($request->has('category_id') && !empty($request->input('category_id'))) {
            $query->where('category_id', $request->input('category_id'));
        }
    
        // Filter by Author
        if ($request->has('author_id') && !empty($request->input('author_id'))) {
            $query->where('author_id', $request->input('author_id'));
        }
    
        // --- Sorting ---
        // Default sort: recently_added in descending order
        $sortBy = $request->input('sort_by', 'recently_added');
        $sortOrder = $request->input('sort_order', 'desc'); // Can be 'asc' or 'desc'
    
        switch ($sortBy) {
            case 'best_reads':
                // Books with more requests come first.
                // Use dynamic sort order instead of hardcoded desc
                $query->orderBy('requests_count', $sortOrder);
                break;
            case 'top_rated':
                // Books with higher average rating come first.
                // COALESCE(review_avg_rating, 0) handles books with no reviews, treating their rating as 0 for sorting.
                $query->orderByRaw("COALESCE(review_avg_rating, 0) " . ($sortOrder === 'asc' ? 'asc' : 'desc'));
                break;
            case 'recently_added':
            default:
                // Use created_at for "recently added" functionality, updated_at is for modifications
                $query->orderBy('created_at', $sortOrder);
                break;
        }
    
        // Add a secondary sort by title for consistent ordering of ties
        $query->orderBy('books.title', 'asc');
    
        // --- Pagination ---
        // Increase default per page to match frontend expectations (frontend shows 4 columns)
        $perPage = $request->input('per_page', 12);
        $books = $query->paginate($perPage);
    
        // --- Format Data for Frontend LibraryBookCard ---
        $formattedBooks = $books->getCollection()->map(function ($book) use ($request) {
            // Calculate total available copies from the eager-loaded 'book_collection' relationship.
            $totalAvailableCopies = $book->book_collection->sum('available_copies');
    
            // Determine if the book is available (boolean)
            $availableStatus = $totalAvailableCopies > 0;
            
            $isLoved = false;
            $user = Auth::guard('sanctum')->user();
            if ($user && $user->reader_id) {
                // Check if book is in user's wishlist
                $userWishlistBookIds = $user->wishlist->pluck('book_id');
                $isLoved = $userWishlistBookIds->contains($book->book_id);
            }
    
            return [
                'id' => $book->book_id,
                'title' => $book->title,
                'author' => $book->author ? $book->author->name : 'Unknown Author',
                'rating' => round($book->review_avg_rating ?? 0, 1), // Fixed property name
                'ratingCount' => $book->requests_count, // Access the aggregated request count
                'isLoved' => $isLoved,
                'availableStatus' => $availableStatus,
                'tags' => $book->category ? $book->category->name : 'Uncategorized', // Using category name as a tag
                'imageUrl' => $book->image_url ?? '/images/default_book_cover.jpg', // Use actual URL, with a fallback
                'total_available_copies' => $totalAvailableCopies, // Raw count for display/debugging
            ];
        });
    
        // Return paginated data with links and meta information for frontend pagination
        return response()->json([
            'data' => $formattedBooks,
            'links' => $books->toArray()['links'], // Pagination links (first, last, prev, next)
            'meta' => collect($books->toArray())->except('data')->toArray(), // All other pagination meta data (current_page, last_page, total, etc.)
        ]);
    }
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate incoming request data
        try {
            $validatedData = $request->validate([
                'book_id' => 'nullable|uuid', // Can be null if it's a new book to the system
                'is_new_book' => 'required|boolean', // Frontend sends this boolean

                // These fields are required ONLY if it's a new book to the system (Case 1)
                'title' => 'required_if:is_new_book,true|string|max:255',
                'author_id' => 'nullable|uuid|exists:authors,author_id',
                'hall_id' => 'nullable|uuid|exists:halls,hall_id',
                'publisher_id' => 'nullable|uuid|exists:publishers,publisher_id',
                'category_id' => 'nullable|uuid|exists:categories,category_id',
                'description' => 'nullable|string',

                'author_name' => 'required_if:author_id,null|string|max:255',
                'publisher_name' => 'required_if:publisher_id,null|string|max:255',
                'category_name' => 'required_if:category_id,null|string|max:255',

                'copies_to_add' => 'required|integer|min:1', // Always required

                // Image file is specifically for new books only
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // Image validation: 2MB max
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error in BookController@store', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        }

        // Ensure the authenticated user is a volunteer and get their hall_id
        $volunteer = $request->user(); // Assuming authenticated user is the volunteer
        if($request->hall_id){
            $hallId = $request->hall_id; // Use hall_id from request if provided
        }
        else if(isset($volunteer->hall_id)){
            $hallId = $volunteer->hall_id; // || $volunteer->admin_id; // Use hall_id or admin_id as needed
        } else{
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized for inserting book.'
            ], 403);
        }
        
        $copiesToAdd = $validatedData['copies_to_add'];
        $imageUrl = null; // Initialize image URL for new books

        DB::beginTransaction(); // Start a database transaction for atomicity
        try {
            if(isset($validatedData['author_name'])) {
                // Create a new author if author_id is not provided
                $author = \App\Models\Author::firstOrCreate(
                    ['name' => $validatedData['author_name']],
                );
                $validatedData['author_id'] = $author->author_id; // Update validated data with new author_id
            }
            if(isset($validatedData['publisher_name'])) {
                // Create a new publisher if publisher_id is not provided
                $publisher = \App\Models\Publisher::firstOrCreate(
                    ['name' => $validatedData['publisher_name']],
                );
                $validatedData['publisher_id'] = $publisher->publisher_id; // Update validated data with new publisher_id
            }
            if(isset($validatedData['category_name'])) {
                // Create a new category if category_id is not provided
                $category = \App\Models\Category::firstOrCreate(
                    ['name' => $validatedData['category_name']],
                );
                $validatedData['category_id'] = $category->category_id; // Update validated data with new category_id
            }


            if ($validatedData['is_new_book']) {
                // CASE 1: The book is new to the system.
                // (frontend sent `is_new_book: true`)

                // Handle image upload if provided
                if ($request->hasFile('image')) {
                    $imageFile = $request->file('image');
                    // Store the image in 'storage/app/public/books' directory
                    // 'store' method returns the path relative to the disk's root (e.g., 'books/unique-filename.jpg')
                    $path = $imageFile->store('books', 'public');
                    // Get the public URL for the stored image to save in DB
                    $imageUrl = Storage::url($path);
                }

                // Create a new Book entry
                $book = Book::create([
                    'title' => $validatedData['title'],
                    'author_id' => $validatedData['author_id'],
                    'publisher_id' => $validatedData['publisher_id'],
                    'category_id' => $validatedData['category_id'],
                    'description' => $validatedData['description'] ?? null,
                    'image_url' => $imageUrl, // Save the image URL/path
                ]);
                $bookId = $book->book_id;

                // Create a new entry in book_collections for this new book and the volunteer's hall
                $bookCollection = BookCollection::create([
                    'book_id' => $bookId,
                    'hall_id' => $hallId,
                    'total_copies' => $copiesToAdd,
                    'available_copies' => $copiesToAdd,
                ]);

                DB::commit(); // Commit the transaction
                return response()->json([
                    'success' => true,
                    'message' => 'New book and copies added successfully.',
                    'data' => $bookCollection->load('book') // Optionally load book details
                ], 201); // 201 Created for new resource

            } else {
                // The book is NOT new to the system.
                // (frontend sent `is_new_book: false`, meaning book_id was provided)
                // No image upload expected here, as book core data already exists.

                $bookId = $validatedData['book_id'];
                $book = Book::where('book_id', $bookId)->first();

                if (!$book) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Existing book with provided ID not found.'
                    ], 404); // 404 Not Found if existing book_id is invalid
                }

                // Check for existing BookCollection for this book and hall
                $bookCollection = BookCollection::where('book_id', $bookId)
                                                ->where('hall_id', $hallId)
                                                ->first();

                if ($bookCollection) {
                    // CASE 3: The book is not new in the system, AND it's not new in the corresponding hall.
                    // (An entry in book_collections already exists for this book_id and hall_id)
                    // Simply add the new copies to existing counts.
                    $bookCollection->total_copies += $copiesToAdd;
                    $bookCollection->available_copies += $copiesToAdd; // Assuming added copies are available
                    $bookCollection->save();

                    DB::commit(); // Commit the transaction
                    return response()->json([
                        'success' => true,
                        'message' => 'Copies added to existing book collection in this hall.',
                        'data' => $bookCollection->load('book')
                    ], 200); // 200 OK for update
                } else {
                    // CASE 2: The book is not new to the system, but it IS new in the specific hall.
                    // (No entry in book_collections exists for this book_id and hall_id yet)
                    // Create a new entry in book_collections for this existing book in this hall.
                    $bookCollection = BookCollection::create([
                        'book_id' => $bookId,
                        'hall_id' => $hallId,
                        'total_copies' => $copiesToAdd,
                        'available_copies' => $copiesToAdd,
                    ]);

                    DB::commit(); // Commit the transaction
                    return response()->json([
                        'success' => true,
                        'message' => 'Book added to this hall for the first time.',
                        'data' => $bookCollection->load('book')
                    ], 201); // 201 Created for new resource
                }
            }
        } catch (\Exception $e) {
            DB::rollBack(); // Rollback on error
            // Log the error for debugging purposes
            Log::error('Error managing book collection: ' . $e->getMessage(), ['exception' => $e, 'request_data' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'An internal server error occurred while managing book collection.'
            ], 500); // 500 Internal Server Error
        }
    }

     /**
     * Display the specified resource (single book) with comprehensive details.
     *
     * @param  \App\Models\Book  $book
     * @param  \Illuminate\Http\Request  $request // Inject Request to check authenticated user
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Book $book, Request $request): JsonResponse
    {
        // Eager load all necessary relationships for a detailed view.
        // - 'author': To get the author's name.
        // - 'publisher': To get the publisher's name.
        // - 'category': (Optional, but good for context if you need category details too)
        // - 'reviews.reader': Load reviews, and for each review, load its associated reader to get their name.
        // - 'collections.hall': Load all book collections for this book, and for each collection, load the hall it belongs to.
        $book->load([
            'author',
            'publisher',
            'category',
            'review.reader',
            'book_collection.hall',
            'wishlist', 
        ]);

        // Calculate total available copies across all halls for this book
        $totalAvailableCopies = $book->book_collection->sum('available_copies');

        
        $isLoved = false;
        $user = Auth::guard('sanctum')->user();
        if ($user && $user->reader_id) {
            // The Model has a wishlists() relationship that returns a collection of Book models
            // $isLoved = $request->user()->wishlist->contains('book_id', $book->book_id);
            $userWishlistBookIds = $user->wishlist->pluck('book_id');
            $isLoved = $userWishlistBookIds->contains($book->book_id);
            
        }

        // Format the reviews array to include reader name, date, rating, and comment
        $formattedReviews = $book->review->map(function ($review) {
            return [
                'review_id' => $review->review_id, // Include review ID if needed
                'name' => $review->reader ? $review->reader->name : 'Anonymous Reader',
                'date' => $review->reviewed_on->format('Y-m-d'), // Format the date as YYYY-MM-DD
                'rating' => $review->rating,
                'comment' => $review->comment,
            ];
        });

        // Format the halls array to show where the book is available and how many copies
        $formattedHalls = $book->book_collection->where("available_copies", ">", 0)->map(function ($collection) {
            return [
                'hall_id' => $collection->hall->hall_id, // Assuming hall_id is primary key
                'hall_name' => $collection->hall->name,
                'available_copies_in_hall' => $collection->available_copies,
            ];
        })->values();

        // Construct the final response object with all requested details
        $response = [
            'id' => $book->book_id,
            'title' => $book->title,
            'description' => $book->description,
            'author' => $book->author ? $book->author->name : 'Unknown Author',
            'publisher' => $book->publisher ? $book->publisher->name : 'Unknown Publisher',
            'imageURL' => $book->image_url ?? '/images/default_book_cover.jpg', // Use actual URL, with fallback
            'availability' => $totalAvailableCopies>0, // Total copies across all halls
            'isLoved' => $isLoved, // Boolean indicating if current user loves it
            'reviews' => $formattedReviews,
            'halls' => $formattedHalls,
            'average_rating' => round($book->review->avg('rating') ?? 0, 1),
            'rating_count' => $book->review->count(),
            'category' => $book->category ? $book->category->name : 'Uncategorized', // Added category as well
        ];

        return response()->json($response);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        DB::beginTransaction();
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('image')) {
                if ($book->image_url) {
                    $oldImagePath = str_replace(Storage::url('/'), '', $book->image_url);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $imagePath = $request->file('image')->store('book_covers', 'public');
                $validatedData['image_url'] = Storage::url($imagePath);
            } elseif (array_key_exists('image', $request->all()) && $request->input('image') === null) {
                if ($book->image_url) {
                    $oldImagePath = str_replace(Storage::url('/'), '', $book->image_url);
                    if (Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $validatedData['image_url'] = null;
            }

            $book->update($validatedData);

            DB::commit();
            return response()->json([
                'message' => 'Book updated successfully.',
                'data' => $book->load(['publisher', 'author', 'category'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update book.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Book $book): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->is_admin ?? false)) {
            abort(Response::HTTP_FORBIDDEN, 'You are not authorized to delete books.');
        }

        DB::beginTransaction();
        try {
            if ($book->image_url) {
                $imagePath = str_replace(Storage::url('/'), '', $book->image_url);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }

            $book->delete();
            DB::commit();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete book.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

        /**
     * Search for books by title.
     * Updated to include image_url and foreign key IDs for frontend auto-fill.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $request->validate(['title' => 'required|string|min:3']);

        $title = $request->query('title');

        $books = Book::where('title', 'LIKE', '%' . $title . '%')
                     ->select('book_id', 'title', 'description', 'image_url',
                              'author_id', 'publisher_id', 'category_id')
                     ->with(['author:author_id,name', 'publisher:publisher_id,name', 'category:category_id,name'])
                     ->limit(10)
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $books->map(function($book) {
                return [
                    'book_id' => $book->book_id,
                    'title' => $book->title,
                    'author_id' => $book->author_id,
                    'publisher_id' => $book->publisher_id,
                    'category_id' => $book->category_id,
                    'description' => $book->description,
                    // Construct full public URL for the image
                    'image_url' => $book->image_url ? Storage::url($book->image_url) : null,
                    // Include names for frontend display in suggestions
                    'author_name' => $book->author->name ?? null,
                    'publisher_name' => $book->publisher->name ?? null,
                    'category_name' => $book->category->name ?? null,
                ];
            })
        ]);
    }
}