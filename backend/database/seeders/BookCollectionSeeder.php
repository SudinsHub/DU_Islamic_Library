<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BookCollection;
use App\Models\Book;
use App\Models\Hall;
use Illuminate\Support\Str; // For UUID generation if creating new collections manually
use Illuminate\Support\Facades\DB; // For database transaction

class BookCollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure Books and Halls exist before trying to create BookCollections
        // It's best practice to call their respective seeders first.
        // For example, in your DatabaseSeeder:
        // $this->call([
        //     HallSeeder::class,
        //     BookSeeder::class,
        // ]);
        
        // As a fallback for this seeder, if called directly, ensure some exist:
        $books = Book::all();
        $halls = Hall::all();

        if ($books->isEmpty()) {
            $this->command->info('No books found. Please seed books first.');
            return;
        }
        if ($halls->isEmpty()) {
            $this->command->info('No halls found. Please seed halls first.');
            return;
        }

        // --- Seeding Strategy 1: Create a collection for EACH existing book in a random hall ---
        // This ensures every book gets an initial collection entry and handles the unique constraint
        $books->each(function ($book) use ($halls) {
            // Pick a random hall for this book
            $randomHall = $halls->random();

            DB::transaction(function () use ($book, $randomHall) {
                $existingCollection = BookCollection::where('book_id', $book->book_id)
                                                  ->where('hall_id', $randomHall->hall_id)
                                                  ->first();

                $totalCopiesToAdd = rand(1, 5); // New copies to add
                $availableCopiesToAdd = rand(0, $totalCopiesToAdd);

                if ($existingCollection) {
                    // Update existing counts
                    $existingCollection->total_copies += $totalCopiesToAdd;
                    $existingCollection->available_copies += $availableCopiesToAdd;
                    // Ensure available_copies does not exceed total_copies after update
                    if ($existingCollection->available_copies > $existingCollection->total_copies) {
                        $existingCollection->available_copies = $existingCollection->total_copies;
                    }
                    $existingCollection->save();
                    $this->command->info("Updated collection for Book ID: {$book->book_id} in Hall ID: {$randomHall->hall_id}");
                } else {
                    // Create a new collection entry
                    BookCollection::factory()->create([
                        'book_id' => $book->book_id,
                        'hall_id' => $randomHall->hall_id,
                        'total_copies' => $totalCopiesToAdd,
                        'available_copies' => $availableCopiesToAdd,
                    ]);
                    $this->command->info("Created new collection for Book ID: {$book->book_id} in Hall ID: {$randomHall->hall_id}");
                }
            });
        });

        // --- Seeding Strategy 2: Create more random collections with specific states ---
        // This will create additional entries. If a book/hall combination already exists,
        // it will update it according to the logic above.
        // It's recommended to do this *after* Strategy 1 to ensure all books have at least one entry.

        // Example: Create 20 more random collection updates/inserts
        for ($i = 0; $i < 20; $i++) {
            DB::transaction(function () use ($books, $halls) {
                $randomBook = $books->random();
                $randomHall = $halls->random();

                $existingCollection = BookCollection::where('book_id', $randomBook->book_id)
                                                  ->where('hall_id', $randomHall->hall_id)
                                                  ->first();

                $totalCopiesToAdd = rand(1, 5);
                $availableCopiesToAdd = rand(0, $totalCopiesToAdd);

                if ($existingCollection) {
                    $existingCollection->total_copies += $totalCopiesToAdd;
                    $existingCollection->available_copies += $availableCopiesToAdd;
                    if ($existingCollection->available_copies > $existingCollection->total_copies) {
                        $existingCollection->available_copies = $existingCollection->total_copies;
                    }
                    $existingCollection->save();
                    $this->command->info("Updated collection for Book ID: {$randomBook->book_id} in Hall ID: {$randomHall->hall_id}");
                } else {
                    BookCollection::factory()->create([
                        'book_id' => $randomBook->book_id,
                        'hall_id' => $randomHall->hall_id,
                        'total_copies' => $totalCopiesToAdd,
                        'available_copies' => $availableCopiesToAdd,
                    ]);
                    $this->command->info("Created new collection for Book ID: {$randomBook->book_id} in Hall ID: {$randomHall->hall_id}");
                }
            });
        }
        
        // Example: Create 5 entries specifically designed to be 'all borrowed' (they'll update if exist)
        // Ensure you have at least 5 unique book-hall combinations left or create them if needed.
        // Or create completely new ones using Book::factory() and Hall::factory() if you want new parents
        // This might conflict with the unique constraint if the generated Book/Hall combo already exists.
        // It's safer to pick existing ones.
        /*
        for ($i = 0; $i < 5; $i++) {
            DB::transaction(function () use ($books, $halls) {
                $randomBook = $books->random();
                $randomHall = $halls->random();

                $existingCollection = BookCollection::where('book_id', $randomBook->book_id)
                                                  ->where('hall_id', $randomHall->hall_id)
                                                  ->first();
                
                $totalCopies = rand(1, 5); // Assume initial total copies
                $availableCopies = 0;      // All borrowed

                if ($existingCollection) {
                    $existingCollection->total_copies = $totalCopies; // Overwrite total
                    $existingCollection->available_copies = $availableCopies; // Set to 0
                    $existingCollection->save();
                    $this->command->info("Set existing collection to allBorrowed for Book ID: {$randomBook->book_id} in Hall ID: {$randomHall->hall_id}");
                } else {
                    BookCollection::factory()->allBorrowed()->create([
                        'book_id' => $randomBook->book_id,
                        'hall_id' => $randomHall->hall_id,
                        'total_copies' => $totalCopies,
                    ]);
                    $this->command->info("Created new allBorrowed collection for Book ID: {$randomBook->book_id} in Hall ID: {$randomHall->hall_id}");
                }
            });
        }
        */

        $this->command->info('BookCollection seeding complete.');
    }
}