<?php

namespace Database\Factories;

use App\Models\Book;      // Your Book model
use App\Models\Publisher; // Associated Publisher model
use App\Models\Author;    // Associated Author model
use App\Models\Category;  // Associated Category model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed, but good for UUID clarity

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Book::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'book_id' => $this->faker->uuid(),
            // Foreign keys using associated factories (assuming they generate UUIDs)
            'publisher_id' => Publisher::factory(),
            'author_id' => Author::factory(),
            'category_id' => Category::factory(),
            'title' => $this->faker->unique()->sentence(rand(3, 7)), // A unique sentence for a title
            'description' => $this->faker->optional(0.8)->paragraph(rand(2, 5)), // 80% chance of a description
            'image_url' => $this->faker->imageUrl(640, 480, 'books', true, $this->faker->words(2, true)),
        ];
    }

    /**
     * Define a state for books with a shorter description.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function shortDescription()
    {
        return $this->state(fn (array $attributes) => [
            'description' => $this->faker->sentence(rand(5, 15)),
        ]);
    }

    /**
     * Define a state for books with no description.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function noDescription()
    {
        return $this->state(fn (array $attributes) => [
            'description' => null,
        ]);
    }
}