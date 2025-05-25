<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreBookRequest;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateBookRequest;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request; // Added for isLoved user context

class BookController extends Controller
{
    /**
     * Display a listing of the unique books, tailored for the LibraryBookCard component.
     * This method aggregates availability across all halls for each book.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    // public function index(Request $request): JsonResponse
    // {
    //     // Eager load necessary relationships to avoid N+1 query problems.
    //     // We need:
    //     // - the Book's Author
    //     // - the Book's Category (for tags)
    //     // - the Book's Reviews (to calculate rating and ratingCount)
    //     // - the Book's Collections (to sum available copies across all halls)
    //     $books = Book::with([
    //         'author',
    //         'category',
    //         'review',
    //         'book_collection' // Eager load book collections to calculate total available copies
    //     ])->get();

    //     // Prepare the data for the frontend LibraryBookCard component
    //     $formattedBooks = $books->map(function ($book) use ($request) {
    //         // Calculate average rating and review count
    //         $averageRating = $book->review->avg('rating');
    //         $ratingCount = $book->review->count();

    //         // Calculate total available copies across ALL collections for this book
    //         $totalAvailableCopies = $book->book_collection()->sum('available_copies');
    //         $availableStatus = $totalAvailableCopies > 0;

    //         // Determine if the book is "loved" by the authenticated user.
    //         // This is a placeholder. You'd need to implement a 'favorites' system
    //         // (e.g., a many-to-many relationship between User and Book)
    //         // and check it here.
    //         $isLoved = false;
    //         // Example if you have a 'favorites' relationship on your User model:
    //         // if ($request->user()) {
    //         //     $isLoved = $request->user()->favoriteBooks->contains($book->book_id);
    //         // }

    //         return [
    //             'id' => $book->book_id, // Primary ID for the component
    //             'title' => $book->title,
    //             'author' => $book->author ? $book->author->name : 'Unknown Author', // Handle case where author might be null
    //             'rating' => round($averageRating ?? 0, 1), // Round to one decimal place, default to 0 if no reviews
    //             'ratingCount' => $ratingCount,
    //             'isLoved' => $isLoved, // Placeholder: false unless implemented
    //             'availableStatus' => $availableStatus, // Now represents total availability across all halls
    //             'tags' => $book->category ? $book->category->name : 'Uncategorized', // Using category name as a tag
    //             'imageUrl' => $book->image_url ?? '/images/default_book_cover.jpg', // Use actual image_url, with a fallback
    //             // Optionally, include the total available copies for debugging/display:
    //             'total_available_copies' => $totalAvailableCopies,
    //         ];
    //     });

    //     return response()->json($formattedBooks);
    // }
    
    
    public function index(Request $request): JsonResponse
    {
        $query = Book::query();

        // Eager load necessary relationships for data transformation
        // 'author' and 'category' are for direct properties
        // 'collections' is for calculating total available copies
        $query->with(['author', 'category', 'book_collection']);

        // Add aggregations for sorting and card display without loading full collections
        // 'reviews_avg_rating' and 'requests_count' will be added as properties to each Book model
        $query->withAvg('review', 'rating') // Adds 'reviews_avg_rating' property
                ->withCount('request'); // Adds 'requests_count' property

        // --- Searching ---
        if ($request->has('search')) { 
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
        if ($request->has('hall_id')) {
            $hallId = $request->input('hall_id');
            $query->whereHas('book_collection', function ($collectionQuery) use ($hallId) {
                $collectionQuery->where('hall_id', $hallId)->where('available_copies', '>', 0);
            });
        }

        // Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter by Author
        if ($request->has('author_id')) {
            $query->where('author_id', $request->input('author_id'));
        }

        // --- Sorting ---
        // Default sort: recently_added in descending order
        $sortBy = $request->input('sort_by', 'recently_added');
        $sortOrder = $request->input('sort_order', 'desc'); // Can be 'asc' or 'desc'

        switch ($sortBy) {
            case 'best_reads':
                // Books with more requests come first.
                // orderByDesc is a shorthand for orderBy('column', 'desc')
                $query->orderByDesc('requests_count');
                break;
            case 'top_rated':
                // Books with higher average rating come first.
                // COALESCE(reviews_avg_rating, 0) handles books with no reviews, treating their rating as 0 for sorting.
                $query->orderByRaw("COALESCE(reviews_avg_rating, 0) " . ($sortOrder === 'asc' ? 'asc' : 'desc'));
                break;
            case 'recently_added':
            default:
                $query->orderBy('updated_at', $sortOrder);

                break;
        }

        // Add a secondary sort by title for consistent ordering of ties
        $query->orderBy('books.title', 'asc');

        // --- Pagination ---
        // You can specify the number of items per page, e.g., 10, 20, etc.
        $perPage = $request->input('per_page', 10);
        $books = $query->paginate($perPage);

        // --- Format Data for Frontend LibraryBookCard ---
        $formattedBooks = $books->getCollection()->map(function ($book) use ($request) {
            // Calculate total available copies from the eager-loaded 'collections' relationship.
            $totalAvailableCopies = $book->book_collection->sum('available_copies');

            // Determine if the book is available (boolean)
            $availableStatus = $totalAvailableCopies > 0;

            // Determine if the book is "loved" by the authenticated user.
            // This is a placeholder. You need to implement your 'favorites' system.
            // For example, if your User model has a 'favoriteBooks' relationship:
            $isLoved = false;
            // if ($request->user() && $request->user()->reader_id) {
            //     $isLoved = $request->user()->favoriteBooks()->where('book_id', $book->book_id)->exists();
            // }

            return [
                'id' => $book->book_id,
                'title' => $book->title,
                'author' => $book->author ? $book->author->name : 'Unknown Author',
                'rating' => round($book->reviews_avg_rating ?? 0, 1), // Access the aggregated average rating
                'ratingCount' => $book->requests_count, // Access the aggregated review count
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
    public function store(StoreBookRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('book_covers', 'public');
                $validatedData['image_url'] = Storage::url($imagePath);
            }

            $book = Book::create($validatedData);

            DB::commit();
            return response()->json([
                'message' => 'Book created successfully.',
                'data' => $book->load(['publisher', 'author', 'category'])
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create book.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
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
            'book_collection.hall'
        ]);

        // Calculate total available copies across all halls for this book
        $totalAvailableCopies = $book->book_collection->sum('available_copies');

        // Determine if the book is "loved" by the authenticated user.
        // This is a placeholder. You need to implement a 'favorites' system
        // (e.g., a many-to-many relationship between User and Book, or a 'user_favorite_books' table).
        $isLoved = false;
        // if (auth()->check()) {
            // Example: Assuming your User model has a 'favoriteBooks' relationship
            // and you've loaded user's favorites or can quickly check existence.
            // This line would check if the authenticated user has favored this specific book.
            // You might need to load user's favoriteBooks or run a query.
            // Example check:
            // if ($request->user()->favoriteBooks()->where('book_id', $book->book_id)->exists()) {
            //     $isLoved = true;
            // }
        // }

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
        $formattedHalls = $book->book_collection->map(function ($collection) {
            return [
                'hall_id' => $collection->hall->hall_id, // Assuming hall_id is primary key
                'hall_name' => $collection->hall->name,
                'available_copies_in_hall' => $collection->available_copies,
            ];
        });

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
}