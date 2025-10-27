<?php

namespace Database\Factories;

use App\Models\Lending;
use App\Models\Volunteer;
use App\Models\Request as LibraryRequest; // Alias for the Request model
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str; // For UUID generation

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lending>
 */
class LendingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Lending::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // For a default state, we try to find a pending request that hasn't been fulfilled yet.
        // This makes the seeding more realistic. If no such request exists, it might fail.
        // The seeder will handle the logic of picking specific requests.
        $reqId = null;
        $pendingRequest = LibraryRequest::where('status', 'pending')
                                        ->whereNull('lending_id') // Ensure it's not already linked
                                        ->inRandomOrder()
                                        ->first();
        if ($pendingRequest) {
            $reqId = $pendingRequest->req_id;
        } else {
            // Fallback: If no pending requests, pick any request (may lead to inconsistencies if not handled by seeder)
            // Or create a new pending request. For a factory, we expect dependencies to exist.
            $reqId = LibraryRequest::inRandomOrder()->firstOrFail()->req_id;
        }

        $issueDate = $this->faker->dateTimeBetween('-6 months', 'now');

        return [
            'lending_id' => $this->faker->uuid(),
            'volunteer_id' => Volunteer::inRandomOrder()->firstOrFail()->volunteer_id,
            'req_id' => $reqId, // Set to the chosen request ID
            'issue_date' => $issueDate->format('Y-m-d'),
            'return_date' => null, // Default to null for 'pending' status
            'status' => 'pending', // Default status for new lending
            // timestamps are automatically handled by Eloquent
        ];
    }

    /**
     * State: Lending is marked as returned.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function returned()
    {
        return $this->state(function (array $attributes) {
            // Ensure return_date is after issue_date and up to now
            $issueDate = new \DateTime($attributes['issue_date'] ?? $this->faker->dateTimeBetween('-6 months', '-1 month')->format('Y-m-d'));
            $returnDate = $this->faker->dateTimeBetween($issueDate, 'now');
            return [
                'return_date' => $returnDate->format('Y-m-d'),
                'status' => 'returned',
            ];
        });
    }

    /**
     * State: Lending is marked as lost.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function lost()
    {
        return $this->state(function (array $attributes) {
            // A lost book might have a 'return_date' set to the date it was declared lost
            $issueDate = new \DateTime($attributes['issue_date'] ?? $this->faker->dateTimeBetween('-6 months', '-1 month')->format('Y-m-d'));
            $lostDate = $this->faker->dateTimeBetween($issueDate, 'now');
            return [
                'return_date' => $lostDate->format('Y-m-d'), // The date it was marked lost
                'status' => 'lost',
            ];
        });
    }
}