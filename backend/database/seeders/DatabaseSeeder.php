<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Author;
use App\Models\Reader;
use App\Models\Request;
use App\Models\Category;
use App\Models\Publisher;
use App\Models\Volunteer;
use App\Models\Department;
use Illuminate\Database\Seeder;
use App\Models\Hall; // Make sure these models exist and have factories configured for UUIDs

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // First, create some Halls and Departments if you don't have any
        Hall::factory(5)->create();
        Department::factory(5)->create();
        Category::factory()->named('Fiction')->create();
        Category::factory()->named('Non-Fiction')->create();
        Category::factory()->named('Science')->create();
        Category::factory()->named('Biography')->create();
        Category::factory()->named('Fantasy')->create();
        Category::factory(4)->create(); 
        Department::factory()->named('Computer Science')->create();
        Department::factory()->named('Electrical Engineering')->create();
        Department::factory()->named('Civil Engineering')->create();
        Department::factory()->named('Physics')->create();
        Department::factory()->named('Chemistry')->create();
        Department::factory()->named('Mathematics')->create();
        Department::factory()->named('Biology')->create();
        Department::factory()->named('Philosophy')->create();
        Publisher::factory()->named('Penguin Random House')->create();
        Publisher::factory()->named('HarperCollins')->create();
        Publisher::factory()->named('Simon & Schuster')->create();
        Publisher::factory(7)->create();
        Author::factory(20)->create();
        Hall::factory(5)->male()->create();
        Hall::factory(3)->female()->create();

        // Then, create readers. Since hall_id and dept_id are foreign keys to UUIDs,
        // using Hall::factory() and Department::factory() inside the Reader factory
        // will automatically associate them.
        Book::factory(100)->create(); // Create 100 fake books
        Reader::factory(50)->create(); // Creates 50 fake readers
        Volunteer::factory(30)->create(); // Creates 30 fake volunteers
        $this->call([
            BookCollectionSeeder::class,
        ]);
        // Create a batch of random requests
        Request::factory(50)->create();
        
        // Create specific types of requests
        Request::factory(10)->pending()->create(); // 10 pending requests
        $this->call([
            LendingSeeder::class,
        ]);
        $this->call([
            ReviewSeeder::class,
        ]);
    }
}