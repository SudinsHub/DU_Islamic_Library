<?php

namespace Database\Factories;

use App\Models\Reader; // Make sure your Reader model is in this namespace
use App\Models\Hall;   // Assuming you have a Hall model
use App\Models\Department; // Assuming you have a Department model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Import Str for UUID generation

class ReaderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Reader::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'reader_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->name(),
            'registration_no' => $this->faker->unique()->numerify('######'), // Example: 6-digit registration number
            'session' => $this->faker->randomElement(['2020-21', '2021-22', '2022-23', '2023-24']),
            'email' => $this->faker->unique()->safeEmail(),
            'contact' => $this->faker->phoneNumber(),
            'hall_id' => Hall::factory(), // Assumes Hall factory exists and generates UUIDs
            'dept_id' => Department::factory(), // Assumes Department factory exists and generates UUIDs
            'password' => 'password', // Or use $this->faker->password() for random passwords
            'isVerified' => $this->faker->boolean(),
            'total_points' => $this->faker->numberBetween(0, 1000),
            'gender' => $this->faker->randomElement(['male', 'female']),
            // timestamps are automatically handled by Eloquent
        ];
    }
}