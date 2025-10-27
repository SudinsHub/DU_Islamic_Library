<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Lending;
use App\Models\Volunteer;
use App\Models\Request as LibraryRequest; // Alias for the Request model
use Illuminate\Support\Facades\DB;

class LendingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crucial: Ensure Volunteers and Requests exist first.
        // It's highly recommended to call their seeders before this one in DatabaseSeeder.

        if (Volunteer::count() === 0) {
            $this->command->warn('No Volunteers found. Seeding Lendings will fail or be limited.');
            // Volunteer::factory(5)->create(); // Uncomment as a fallback if necessary
        }
        if (LibraryRequest::count() === 0) {
            $this->command->warn('No Requests found. Seeding Lendings will fail or be limited.');
            // LibraryRequest::factory(20)->create(); // Uncomment as a fallback if necessary
        }

        // --- Strategy: Fulfill existing pending requests with new lendings ---
        $pendingRequests = LibraryRequest::where('status', 'pending')
                                         ->whereNull('lending_id') // Ensure no lending is already attached
                                         ->get();

        $fulfilledCount = 0;
        foreach ($pendingRequests as $request) {
            // Only fulfill a subset to leave some requests pending
            if (rand(0, 100) < 70) { // Fulfill ~70% of pending requests
                DB::transaction(function () use ($request) {
                    try {
                        // 1. Create the Lending record
                        $lending = Lending::factory()->create([
                            'volunteer_id' => Volunteer::inRandomOrder()->firstOrFail()->volunteer_id,
                            'req_id' => $request->req_id,
                            'issue_date' => $request->request_date, // Issue date same as request date for simplicity
                            'status' => 'pending', // Lending is 'pending' until returned
                        ]);

                        // 2. Update the associated Request
                        $request->status = 'fulfilled';
                        $request->lending_id = $lending->lending_id;
                        $request->save();

                        $this->command->info("Fulfilled Request ID: {$request->req_id} with new Lending ID: {$lending->lending_id}");
                    } catch (\Exception $e) {
                        $this->command->error("Failed to fulfill Request ID: {$request->req_id}. Error: {$e->getMessage()}");
                        throw $e; // Re-throw to trigger rollback
                    }
                });
                $fulfilledCount++;
            }
        }
        $this->command->info("Successfully fulfilled {$fulfilledCount} requests with new lendings.");

        // --- Strategy: Create some returned and lost lendings (from already fulfilled requests) ---
        // Find some existing fulfilled requests that have lendings
        $existingLendings = Lending::where('status', 'pending')->get();
        $returnedCount = 0;
        $lostCount = 0;

        foreach ($existingLendings as $lending) {
            if (rand(0, 100) < 60) { // Mark ~60% of pending lendings as returned
                DB::transaction(function () use ($lending) {
                    try {
                        $lending->returned()->save(); // Use the 'returned' state method
                        // Importantly, increment available copies in BookCollection when returned
                        if ($lending->request && $lending->request->book && $lending->request->hall) {
                            $bookCollection = \App\Models\BookCollection::where('book_id', $lending->request->book->book_id)
                            ->where('hall_id', $lending->request->hall->hall_id)->first();
                            
                            if ($bookCollection) {
                                $bookCollection->increment('available_copies');
                                $this->command->info("Incremented available copies for Book ID: {$lending->request->book->book_id} in Hall ID: {$lending->request->hall->hall_id}");
                            }
                        }
                        $this->command->info("Marked Lending ID: {$lending->lending_id} as returned.");
                    } catch (\Exception $e) {
                        $this->command->error("Failed to mark Lending ID: {$lending->lending_id} as returned. Error: {$e->getMessage()}");
                        throw $e;
                    }
                });
                $returnedCount++;
            } elseif (rand(0, 100) < 10) { // Mark ~10% as lost (from remaining pending)
                 DB::transaction(function () use ($lending) {
                    try {
                        $lending->lost()->save(); // Use the 'lost' state method
                        // Do NOT increment available copies for lost books.
                        $this->command->info("Marked Lending ID: {$lending->lending_id} as lost.");
                    } catch (\Exception $e) {
                        $this->command->error("Failed to mark Lending ID: {$lending->lending_id} as lost. Error: {$e->getMessage()}");
                        throw $e;
                    }
                });
                $lostCount++;
            }
        }
        $this->command->info("Marked {$returnedCount} lendings as returned and {$lostCount} as lost.");

        $this->command->info('Lending seeding complete.');
    }
}