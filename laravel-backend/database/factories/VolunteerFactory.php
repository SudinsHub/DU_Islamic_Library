<?php

namespace Database\Factories;

use App\Models\Volunteer; // Make sure your Volunteer model is in this namespace
use App\Models\Hall;       // Assuming you have a Hall model
use App\Models\Department; // Assuming you have a Department model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // Not strictly needed for faker->uuid(), but good for clarity

class VolunteerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Volunteer::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'volunteer_id' => $this->faker->uuid(), // Generates a UUID for the primary key
            'name' => $this->faker->name(),
            'registration_no' => $this->faker->unique()->numerify('V#####'), // Example: V followed by 5 digits
            'email' => $this->faker->unique()->safeEmail(),
            'contact' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'hall_id' => Hall::factory(),       // Assumes Hall factory exists and generates UUIDs
            'dept_id' => Department::factory(),  // Assumes Department factory exists and generates UUIDs
            'session' => $this->faker->randomElement(['2020-21', '2021-22', '2022-23', '2023-24', '2024-25']),
            'password' => 'password', // Use bcrypt for hashed passwords
            'isAvailable' => $this->faker->boolean(),
            'isVerified' => $this->faker->boolean(),
            'room_no' => $this->faker->optional()->numberBetween(101, 500), // Nullable room number
            // timestamps are automatically handled by Eloquent
        ];
    }
}