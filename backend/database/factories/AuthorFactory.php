<?php

namespace Database\Factories;

use App\Models\Author; // Make sure your Author model is in this namespace
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly necessary for faker->uuid(), but can be helpful

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Author>
 */
class AuthorFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Author::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->unique()->name(), // Generates a unique full name
        ];
    }

    /**
     * Indicate that the author has a specific name.
     *
     * @param string $name
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function named(string $name)
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }
}