<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Author;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class AdminBookController extends Controller
{
    /**
     * Display a listing of the books with pagination and filters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Book::with(['author', 'publisher', 'category']);

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('publisher_id')) {
            $query->where('publisher_id', $request->publisher_id);
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        $perPage = $request->input('per_page', 10);
        $books = $query->paginate($perPage);

        return response()->json($books);
    }

    /**
     * Store a newly created book in storage.
     *
     * This method is not directly used by the provided frontend code for *creating* books,
     * but it's good practice to include for completeness if you add a create form later.
     * The frontend's "edit" dialog handles updates to existing books.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'nullable|uuid|exists:authors,id',
            'author_name' => 'nullable|string|max:255',
            'publisher_id' => 'nullable|uuid|exists:publishers,id',
            'publisher_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'category_name' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // Max 2MB
        ]);

        // Validate that either ID or Name is provided, but not both for each relation
        if (empty($validatedData['author_id']) && empty($validatedData['author_name'])) {
            return response()->json(['message' => 'Either author_id or author_name is required.'], 422);
        }
        if (empty($validatedData['publisher_id']) && empty($validatedData['publisher_name'])) {
            return response()->json(['message' => 'Either publisher_id or publisher_name is required.'], 422);
        }
        if (empty($validatedData['category_id']) && empty($validatedData['category_name'])) {
            return response()->json(['message' => 'Either category_id or category_name is required.'], 422);
        }

        $book = new Book();
        $book->title = $validatedData['title'];
        $book->description = $validatedData['description'];

        // Handle Author
        if ($request->filled('author_id')) {
            $book->author_id = $request->author_id;
        } elseif ($request->filled('author_name')) {
            $author = Author::firstOrCreate(['name' => $request->author_name]);
            $book->author_id = $author->id;
        }

        // Handle Publisher
        if ($request->filled('publisher_id')) {
            $book->publisher_id = $request->publisher_id;
        } elseif ($request->filled('publisher_name')) {
            $publisher = Publisher::firstOrCreate(['name' => $request->publisher_name]);
            $book->publisher_id = $publisher->id;
        }

        // Handle Category
        if ($request->filled('category_id')) {
            $book->category_id = $request->category_id;
        } elseif ($request->filled('category_name')) {
            $category = Category::firstOrCreate(['name' => $request->category_name]);
            $book->category_id = $category->id;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('public/book_covers');
            $book->image_url = Storage::url($path);
        }

        $book->save();

        return response()->json(['message' => 'Book created successfully.', 'book' => $book->load(['author', 'publisher', 'category'])], 201);
    }

    /**
     * Update the specified book in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Book  $book
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Book $book)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'nullable|uuid|exists:authors,id',
            'author_name' => 'nullable|string|max:255',
            'publisher_id' => 'nullable|uuid|exists:publishers,id',
            'publisher_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'category_name' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'clear_image' => 'nullable|boolean', // Custom flag to clear image
        ]);

        // Conditional validation for author, publisher, category:
        // If author_id is provided, author_name should not be, and vice-versa.
        // If neither is provided (for example, if editing a book that already has an author
        // and the user doesn't change it), that's fine. We only require one IF the field is being set/changed.
        if (!($request->filled('author_id') || $request->filled('author_name'))) {
             // If neither is provided and it's currently null, it's an error.
            if (is_null($book->author_id)) {
                return response()->json(['message' => 'Either author_id or author_name is required.'], 422);
            }
        }
        if (!($request->filled('publisher_id') || $request->filled('publisher_name'))) {
            if (is_null($book->publisher_id)) {
                return response()->json(['message' => 'Either publisher_id or publisher_name is required.'], 422);
            }
        }
        if (!($request->filled('category_id') || $request->filled('category_name'))) {
            if (is_null($book->category_id)) {
                return response()->json(['message' => 'Either category_id or category_name is required.'], 422);
            }
        }


        $book->title = $validatedData['title'];
        $book->description = $validatedData['description'];

        // Handle Author update
        if ($request->filled('author_id')) {
            $book->author_id = $request->author_id;
            $book->author_name = null; // Clear if ID is selected
        } elseif ($request->filled('author_name')) {
            $author = Author::firstOrCreate(['name' => $request->author_name]);
            $book->author_id = $author->id;
            $book->author_name = null;
        }
        // If neither is filled and there was an existing author, keep it.
        // If both are empty and there was no author, it implies nulling it out,
        // which is handled by the Zod transform from the frontend converting '' to null.

        // Handle Publisher update
        if ($request->filled('publisher_id')) {
            $book->publisher_id = $request->publisher_id;
            $book->publisher_name = null;
        } elseif ($request->filled('publisher_name')) {
            $publisher = Publisher::firstOrCreate(['name' => $request->publisher_name]);
            $book->publisher_id = $publisher->id;
            $book->publisher_name = null;
        }

        // Handle Category update
        if ($request->filled('category_id')) {
            $book->category_id = $request->category_id;
            $book->category_name = null;
        } elseif ($request->filled('category_name')) {
            $category = Category::firstOrCreate(['name' => $request->category_name]);
            $book->category_id = $category->id;
            $book->category_name = null;
        }

        // Handle image update/removal
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($book->image_url) {
                Storage::delete(str_replace('/storage/', 'public/', $book->image_url));
            }
            $path = $request->file('image')->store('public/book_covers');
            $book->image_url = Storage::url($path);
        } elseif ($request->input('clear_image') === 'true') {
            // User explicitly requested to clear the image
            if ($book->image_url) {
                Storage::delete(str_replace('/storage/', 'public/', $book->image_url));
            }
            $book->image_url = null;
        }

        $book->save();

        return response()->json(['message' => 'Book updated successfully.', 'book' => $book->load(['author', 'publisher', 'category'])]);
    }

    /**
     * Remove the specified book from storage.
     *
     * @param  \App\Models\Book  $book
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Book $book)
    {
        if ($book->image_url) {
            Storage::delete(str_replace('/storage/', 'public/', $book->image_url));
        }
        $book->delete();

        return response()->json(['message' => 'Book deleted successfully.']);
    }
}