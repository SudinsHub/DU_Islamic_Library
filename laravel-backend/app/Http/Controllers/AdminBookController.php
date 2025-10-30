<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Author;
use Illuminate\Routing\Controller;
use App\Models\Category;
use App\Models\Publisher;
use App\Models\Hall;
use App\Models\BookCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
// put, post, delete, (post kora baki ase)
class AdminBookController extends Controller
{
    /**
     * Display a listing of the books.
     * Includes filtering by title, hall, author, publisher, category.
     */
    public function index(Request $request)
    {
        $query = Book::with(['author', 'publisher', 'category', 'book_collection.hall']);

        if ($request->has('title') && $request->input('title') !== '') {
            $query->where('title', 'like', '%' . $request->input('title') . '%');
        }

        if ($request->has('author_id') && $request->input('author_id') !== '') {
            $query->where('author_id', $request->input('author_id'));
        }

        if ($request->has('publisher_id') && $request->input('publisher_id') !== '') {
            $query->where('publisher_id', $request->input('publisher_id'));
        }

        if ($request->has('category_id') && $request->input('category_id') !== '') {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('hall_id') && $request->input('hall_id') !== '') {
            $hallId = $request->input('hall_id');
            $query->whereHas('book_collection', function ($q) use ($hallId) {
                $q->where('hall_id', $hallId);
            });
        }

        $books = $query->paginate(10); // Or adjust pagination as needed

        return response()->json($books);
    }

    /**
     * Store a newly created book in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:2048',
            'author' => 'required', // Can be ID or name
            'publisher' => 'required', // Can be ID or name
            'category' => 'required', // Can be ID or name
        ]);

        $authorId = $this->resolveEntityId(Author::class, $request->input('author'));
        $publisherId = $this->resolveEntityId(Publisher::class, $request->input('publisher'));
        $categoryId = $this->resolveEntityId(Category::class, $request->input('category'));

        $book = Book::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'author_id' => $authorId,
            'publisher_id' => $publisherId,
            'category_id' => $categoryId,
        ]);

        return response()->json($book->load(['author', 'publisher', 'category']), 201);
    }

    /**
     * Display the specified book.
     */
    public function show(Book $book)
    {
        return response()->json($book->load(['author', 'publisher', 'category', 'book_collection.hall']));
    }

    /**
     * Update the specified book in storage.
     */
    public function update(Request $request, Book $book)
    {
        Log::debug("Incoming request for book update:", $request->all());
        Log::debug("Book model found by route model binding:", $book->toArray());

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|url|max:2048',
            'author' => 'required',
            'publisher' => 'required',
            'category' => 'required',
        ]);

        $authorId = $this->resolveEntityId(Author::class, $request->input('author'));
        $publisherId = $this->resolveEntityId(Publisher::class, $request->input('publisher'));
        $categoryId = $this->resolveEntityId(Category::class, $request->input('category'));

        $book->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'author_id' => $authorId,
            'publisher_id' => $publisherId,
            'category_id' => $categoryId,
        ]);

        return response()->json($book->load(['author', 'publisher', 'category']));
    }

    /**
     * Remove the specified book from storage.
     */
    public function destroy(Book $book)
    {
        Log::debug("Book model found by route model binding:", $book->toArray());
        try {
            $book->book_collection()->delete();
            $book->delete();
            return response()->json(['message' => "successfully deleted"], 204);
        } catch (\Exception $e) {
            Log::error("Failed to delete book: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete book'], 500);
        }
    }

    /**
     * Inventory Management
     */

    /**
     * Get book_collection for a specific book.
     */
    public function getBookCollections(Book $book)
    {
        return response()->json($book->book_collection()->with('hall')->get());
    }

    /**
     * Update or create book collection.
     * Takes an array of book_collection: [{ hall_id, available_copies, total_copies, collection_id (optional) }]
     */
    public function manageBookCollections(Request $request, Book $book)
    {
        $request->validate([
            'book_collection' => 'required|array',
            'book_collection.*.hall_id' => 'required|uuid|exists:halls,hall_id',
            'book_collection.*.available_copies' => 'required|integer|min:0',
            'book_collection.*.total_copies' => 'required|integer|min:0|gte:book_collection.*.available_copies',
            'book_collection.*.collection_id' => 'nullable|uuid|exists:book_book_collection,collection_id',
        ]);

        $existingCollectionIds = $book->book_collection->pluck('collection_id')->toArray();
        $updatedCollectionIds = [];

        foreach ($request->input('book_collection') as $collectionData) {
            if (isset($collectionData['collection_id']) && in_array($collectionData['collection_id'], $existingCollectionIds)) {
                // Update existing collection
                $collection = BookCollection::find($collectionData['collection_id']);
                $collection->update([
                    'available_copies' => $collectionData['available_copies'],
                    'total_copies' => $collectionData['total_copies'],
                ]);
                $updatedCollectionIds[] = $collection->collection_id;
            } else {
                // Create new collection
                $collection = BookCollection::create([
                    'book_id' => $book->book_id,
                    'hall_id' => $collectionData['hall_id'],
                    'available_copies' => $collectionData['available_copies'],
                    'total_copies' => $collectionData['total_copies'],
                ]);
                $updatedCollectionIds[] = $collection->collection_id;
            }
        }

        // Delete book_collection that were not present in the update request
        $book_collectionToDelete = array_diff($existingCollectionIds, $updatedCollectionIds);
        BookCollection::whereIn('collection_id', $book_collectionToDelete)->delete();

        return response()->json($book->book_collection()->with('hall')->get());
    }

    /**
     * Helper function to resolve entity ID (Author, Publisher, Category).
     * If input is an ID, return it. If it's a name, find or create the entity.
     */
    private function resolveEntityId($modelClass, $input)
    {
        // Create an instance of the model to call instance methods
        $modelInstance = new $modelClass();
    
        if (Str::isUuid($input)) {
            // It's likely an ID
            // Use $modelInstance->getKeyName() instead of $modelClass::getKeyName()
            if ($modelClass::where($modelInstance->getKeyName(), $input)->exists()) {
                return $input;
            }
        }
    
        // Assume it's a name, find or create
        $entity = $modelClass::firstOrCreate(
            ['name' => $input],
            ['name' => $input]
        );
    
        // Use $modelInstance->getKeyName() instead of $modelClass::getKeyName()
        return $entity->{$modelInstance->getKeyName()};
    }
}