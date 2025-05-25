<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\Reader; // Import the Reader model
use App\Models\Book;   // Import the Book model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // For UUID generation if you create them in factory

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Review::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure that Readers and Books exist before trying to get their IDs.
        // If your ReaderSeeder and BookSeeder run before this, these will find existing ones.
        // Otherwise, it might create them on the fly if `firstOrCreate` or `factory()->create()` is used.
        // For a clean factory, we assume dependencies exist.
        $reader = Reader::inRandomOrder()->first();
        if (!$reader) {
            // Fallback: If no readers exist, create one.
            // In a real seeding scenario, ensure ReaderSeeder runs before ReviewSeeder.
            $reader = Reader::factory()->create();
        }

        $book = Book::inRandomOrder()->first();
        if (!$book) {
            // Fallback: If no books exist, create one.
            // In a real seeding scenario, ensure BookSeeder runs before ReviewSeeder.
            $book = Book::factory()->create();
        }

        return [
            'review_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'reader_id' => $reader->reader_id,
            'book_id' => $book->book_id,
            'rating' => $this->faker->numberBetween(1, 5), // Rating between 1 and 5
            'comment' => $this->faker->optional(0.8)->paragraph(2), // 80% chance of having a comment
            'reviewed_on' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'), // Reviewed date within the last year
        ];
    }

    /**
     * Indicate that the review has no comment.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function noComment(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'comment' => null,
        ]);
    }

    /**
     * Indicate a low rating (1 or 2 stars).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function lowRating(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->numberBetween(1, 2),
        ]);
    }

    /**
     * Indicate a high rating (4 or 5 stars).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function highRating(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->numberBetween(4, 5),
        ]);
    }
}