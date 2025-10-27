<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Reader; // Import the Reader model
use App\Models\Book;   // Import the Book model

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding reviews...');

        // Ensure Readers and Books exist before creating reviews.
        // It's crucial that ReaderSeeder and BookSeeder run before this one.
        if (Reader::count() === 0) {
            $this->command->warn('No Readers found. Please run ReaderSeeder first or consider creating some readers here as a fallback.');
            // Optionally, create some fallback readers if none exist
            // Reader::factory(5)->create();
        }
        if (Book::count() === 0) {
            $this->command->warn('No Books found. Please run BookSeeder first or consider creating some books here as a fallback.');
            // Optionally, create some fallback books if none exist
            // Book::factory(10)->create();
        }

        // Only proceed if there are readers and books to link to
        if (Reader::count() > 0 && Book::count() > 0) {
            $numberOfReviews = 50; // Total number of reviews to create

            // Create a mix of reviews
            Review::factory()->count(round($numberOfReviews * 0.6))->create(); // 60% standard reviews
            Review::factory()->count(round($numberOfReviews * 0.2))->highRating()->create(); // 20% high rating reviews
            Review::factory()->count(round($numberOfReviews * 0.1))->lowRating()->create(); // 10% low rating reviews
            Review::factory()->count(round($numberOfReviews * 0.1))->noComment()->create(); // 10% no comment reviews

            $this->command->info("Seeded {$numberOfReviews} reviews.");
        } else {
            $this->command->error('Skipping review seeding due to missing Reader or Book dependencies.');
        }
    }
}