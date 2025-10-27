<?php

namespace Database\Factories;

use App\Models\ReadingHistory;
use App\Models\Reader;
use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReadingHistory>
 */
class ReadingHistoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ReadingHistory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure that Readers and Books exist before trying to get their IDs.
        $reader = Reader::inRandomOrder()->first();
        if (!$reader) {
            $reader = Reader::factory()->create(); // Fallback: create if none exist
        }

        $book = Book::inRandomOrder()->first();
        if (!$book) {
            $book = Book::factory()->create(); // Fallback: create if none exist
        }

        $startedOn = $this->faker->dateTimeBetween('-2 years', 'now');
        $finishedOn = $this->faker->optional(0.7)->dateTimeBetween($startedOn, 'now'); // 70% chance of being finished

        return [
            'history_id' => $this->faker->uuid(),
            'reader_id' => $reader->reader_id,
            'book_id' => $book->book_id,
            'started_on' => $startedOn->format('Y-m-d'),
            'finished_on' => $finishedOn ? $finishedOn->format('Y-m-d') : null,
        ];
    }

    /**
     * State: Reading is currently in progress (no finished_on date).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function inProgress(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'finished_on' => null,
            'started_on' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
        ]);
    }

    /**
     * State: Reading has been completed (has a finished_on date).
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function completed(): Factory
    {
        return $this->state(function (array $attributes) {
            $startedOn = $attributes['started_on'] ?? $this->faker->dateTimeBetween('-2 years', '-1 month');
            return [
                'started_on' => $startedOn->format('Y-m-d'),
                'finished_on' => $this->faker->dateTimeBetween($startedOn, 'now')->format('Y-m-d'),
            ];
        });
    }
}