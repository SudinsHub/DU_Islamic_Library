<?php

namespace Database\Factories;

use App\Models\Hall; // Ensure your Hall model is in this namespace
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed for faker->uuid(), but good for clarity

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hall>
 */
class HallFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Hall::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'hall_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->unique()->city() . ' Hall', // Example: "New York Hall"
            'gender' => $this->faker->randomElement(['male', 'female']), // Randomly picks 'male' or 'female'
        ];
    }

    /**
     * Indicate that the hall is for a specific gender.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function male()
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'male',
        ]);
    }

    /**
     * Indicate that the hall is for a specific gender.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function female()
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'female',
        ]);
    }

    /**
     * Indicate that the hall has a specific name.
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