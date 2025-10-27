<?php

namespace Database\Factories;

use App\Models\Request; // Your Request model (assuming you renamed the class to avoid conflict with Illuminate\Http\Request)
use App\Models\Reader;  // Associated Reader model
use App\Models\Book;    // Associated Book model
use App\Models\Hall;    // Associated Hall model
use App\Models\Lending; // Associated Lending model (nullable)
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // For UUID generation

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Request>
 */
class RequestFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Request::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure parent models exist before trying to fetch their IDs
        // This factory assumes that Reader, Book, and Hall records are already present.
        // It's crucial to seed these first in your DatabaseSeeder.

        return [
            'req_id' => $this->faker->uuid(),
            'reader_id' => Reader::inRandomOrder()->firstOrFail()->reader_id,
            'book_id' => Book::inRandomOrder()->firstOrFail()->book_id,
            'hall_id' => Hall::inRandomOrder()->firstOrFail()->hall_id,
            'request_date' => $this->faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'), // A date within the last year
            'status' => $this->faker->randomElement(['pending', 'fulfilled', 'cancelled']),
            // timestamps are automatically handled by Eloquent
        ];
    }

    /**
     * State: Request is pending.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * State: Request is fulfilled.
     * This implies it should have a lending_id.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function fulfilled()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'fulfilled',
        ]);
    }

    /**
     * State: Request is cancelled.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function cancelled()
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }


}