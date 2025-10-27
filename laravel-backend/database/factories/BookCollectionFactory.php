<?php

namespace Database\Factories;

use App\Models\BookCollection;
use App\Models\Book;
use App\Models\Hall;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // For UUID generation

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookCollection>
 */
class BookCollectionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BookCollection::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // First, ensure that there are books and halls available
        // If not, this might throw an error during factory usage.
        // It's generally better to ensure these exist in the seeder before calling this factory.
        $bookId = Book::inRandomOrder()->firstOrFail()->book_id;
        $hallId = Hall::inRandomOrder()->firstOrFail()->hall_id;

        $totalCopies = $this->faker->numberBetween(1, 10);
        $availableCopies = $this->faker->numberBetween(0, $totalCopies);

        return [
            'collection_id' => $this->faker->uuid(),
            'book_id' => $bookId,
            'hall_id' => $hallId,
            'total_copies' => $totalCopies,
            'available_copies' => $availableCopies,
            // timestamps are automatically handled by Eloquent
        ];
    }

    /**
     * Configure the model factory.
     * This is useful for adjusting attributes after they've been defined
     * but before the model is made/created.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterMaking(function (BookCollection $bookCollection) {
            // Ensure available_copies does not exceed total_copies,
            // useful if states or overrides might cause this.
            if ($bookCollection->available_copies > $bookCollection->total_copies) {
                $bookCollection->available_copies = $bookCollection->total_copies;
            }
        });
    }

    /**
     * State: all copies are borrowed (0 available).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function allBorrowed()
    {
        return $this->state(function (array $attributes) {
            $totalCopies = $attributes['total_copies'] ?? $this->faker->numberBetween(1, 10);
            return [
                'total_copies' => $totalCopies,
                'available_copies' => 0,
            ];
        });
    }

    /**
     * State: all copies are in stock (available_copies == total_copies).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function fullyStocked()
    {
        return $this->state(function (array $attributes) {
            $totalCopies = $attributes['total_copies'] ?? $this->faker->numberBetween(1, 10);
            return [
                'total_copies' => $totalCopies,
                'available_copies' => $totalCopies,
            ];
        });
    }
}