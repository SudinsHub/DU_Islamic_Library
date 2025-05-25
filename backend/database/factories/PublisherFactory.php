<?php

namespace Database\Factories;

use App\Models\Publisher; // Make sure your Publisher model is in this namespace
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed for faker->uuid(), but good for clarity

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Publisher>
 */
class PublisherFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Publisher::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'publisher_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->unique()->company(), // Generates a unique company name
        ];
    }

    /**
     * Indicate that the publisher has a specific name.
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