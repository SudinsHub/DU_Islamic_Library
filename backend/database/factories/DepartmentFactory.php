<?php

namespace Database\Factories;

use App\Models\Department; // Make sure your Department model is in this namespace
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed for faker->uuid(), but good for clarity

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Department::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dept_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->word() . ' Department ' . $this->faker->unique()->randomNumber(4), 
        ];
    }

    /**
     * Indicate that the department has a specific name.
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