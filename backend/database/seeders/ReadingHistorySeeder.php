<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ReadingHistory;
use App\Models\Reader;
use App\Models\Book;

class ReadingHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding reading histories...');

        // Ensure Readers and Books exist before creating history entries.
        if (Reader::count() === 0) {
            $this->command->warn('No Readers found. Please run ReaderSeeder first or create some readers here as a fallback.');
            // Reader::factory(10)->create(); // Fallback
        }
        if (Book::count() === 0) {
            $this->command->warn('No Books found. Please run BookSeeder first or create some books here as a fallback.');
            // Book::factory(20)->create(); // Fallback
        }

        if (Reader::count() > 0 && Book::count() > 0) {
            $numberOfHistories = 100; // Total number of history entries to create

            // Create a mix of in-progress and completed histories
            ReadingHistory::factory()->count(round($numberOfHistories * 0.4))->inProgress()->create(); // 40% in progress
            ReadingHistory::factory()->count(round($numberOfHistories * 0.6))->completed()->create(); // 60% completed

            $this->command->info("Seeded {$numberOfHistories} reading history entries.");
        } else {
            $this->command->error('Skipping reading history seeding due to missing Reader or Book dependencies.');
        }
    }
}