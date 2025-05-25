<?php

namespace Database\Factories;

use App\Models\Category; // Make sure your Category model is in this namespace
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed, but good practice for UUID generation

class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'category_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->unique()->word(), // Generates a unique single word (e.g., "Fiction", "Science")
        ];
    }

    /**
     * Indicate that the category is a specific type.
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