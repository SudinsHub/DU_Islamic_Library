<?php

namespace App\Http\Controllers\API;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookController
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $query = Book::with(['author', 'publisher', 'category', 'bookCollections.hall'])
            ->withAvg('reviews as average_rating', 'rating'); // Get average rating
    
        // 🔍 Search by title or author name
        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhereHas('author', fn($q) => 
                      $q->where('name', 'like', "%{$search}%")
                  );
        }
    
        // ✅ Filter by available copies in any hall
        if ($request->boolean('available_only')) {
            $query->whereHas('bookCollections', fn($q) =>
                $q->where('available_copies', '>', 0)
            );
        }
    
        // ✅ Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }
    
        // ✅ Filter by author
        if ($authorId = $request->input('author_id')) {
            $query->where('author_id', $authorId);
        }
    
        // ✅ Filter by publisher
        if ($publisherId = $request->input('publisher_id')) {
            $query->where('publisher_id', $publisherId);
        }
    
        // ⬇ Sorting
        if ($sort = $request->input('sort_by')) {
            $direction = $request->input('direction', 'desc');
    
            if ($sort === 'rating') {
                $query->orderBy('average_rating', $direction);
            } elseif ($request->sort === 'most_borrowed') {
                $query->withCount(['readingHistories as borrow_count'])
                      ->orderByDesc('borrow_count');
            }
            
        } else {
            $query->latest(); // Default sort: newest
        }
    
        // 📄 Paginate (default: 10 per page)
        $books = $query->paginate($request->input('per_page', 10));
    
        return response()->json($books);
    }
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        // stroring the book where author category title is must
        $request->validate([
            'title' => 'required',
            'author' => 'required',
            'category' => 'required',
            'publisher' => 'required',
            'description' => 'nullable',
        ]);

        $publisher_id = $request->publisher;
        $author_id = $request->author;
        $category_id = $request->category;
        
        if (!Str::isUuid($request->author)) {
            // Check if the request has 'author' value
            if ($request->has('author')) {
                // Create author if it doesn't exist
                $author = Author::firstOrCreate(['name' => $request->author]);
                $author_id = $author->id;
            }
        }

        if (!Str::isUuid($request->category)) {
            // Check if the request has 'category' value
            if ($request->has('category')) {
            // Create category if it doesn't exist
            $category = Category::firstOrCreate(['name' => $request->category]);
            $category_id = $category->id;
            }
        }

        if (!Str::isUuid($request->publisher)) {
            // Check if the request has 'publisher' value
            if ($request->has('publisher')) {
            // Create publisher if it doesn't exist
            $publisher = Publisher::firstOrCreate(['name' => $request->publisher]);
            $request->merge(['publisher_id' => $publisher->id]);
            $publisher_id = $publisher->id;
            }
        }

        $book = new Book();
        $book->title = $request->title;
        $book->author_id = $author_id;
        $book->category_id = $category_id;
        $book->publisher_id = $publisher_id;
        $book->description = $request->description;
        $book->save();
        return response()->json([
            'message' => 'Book created successfully',
            'book' => $book,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $book = Book::with([
            'reviews',
            'author',
            'publisher',
            'category',
            'bookCollections.hall', // nested eager loading
        ])->find($id);
    
        if (!$book) {
            return response()->json([
                'message' => 'Book not found',
            ], 404);
        }
    
        $reviews = $book->reviews;
        $averageRating = round($reviews->avg('rating'), 2);
    
        // Extract hall names from nested relation
        $hallNames = $book->bookCollections
            ->map(fn($bc) => $bc->hall?->name)
            ->filter() // remove nulls if any
            ->unique()
            ->values();
    
        return response()->json([
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author->name ?? null,
            'publisher' => $book->publisher->name ?? null,
            'category' => $book->category->name ?? null,
            'reviews' => $reviews,
            'average_rating' => $averageRating,
            'hall_names' => $hallNames,
        ]);
    }
    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json([
                'message' => 'Book not found',
            ], 404);
        }

        $request->validate([
            'title' => 'required',
            'author_id' => 'required',
            'category_id' => 'required',
            'publisher_id' => 'required',
            'description' => 'nullable',
        ]);

        $book->title = $request->title;
        $book->author_id = $request->author_id;
        $book->category_id = $request->category_id;
        $book->publisher_id = $request->publisher_id;
        $book->description = $request->description;
        $book->save();
        return response()->json([
            'message' => 'Book updated successfully',
            'book' => $book,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json([
                'message' => 'Book not found',
            ], 404);
        }
        $book->delete();
        return response()->json([
            'message' => 'Book deleted successfully',
        ], 200);
    }
}
