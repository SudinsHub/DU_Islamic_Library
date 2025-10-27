<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hall extends Model
{
    /** @use HasFactory<\Database\Factories\HallFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'hall_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'gender',
    ];

    // Your migration does not include timestamps for this table.
    // If you don't want Laravel to manage `created_at` and `updated_at`,
    // you should explicitly disable them:
    public $timestamps = false;

    public function reader() { return $this->hasMany(Reader::class, 'hall_id'); }
    public function volunteer() { return $this->hasMany(Volunteer::class, 'hall_id'); }
    public function book_collection() { return $this->hasMany(BookCollection::class, 'hall_id'); }
    public function request() { return $this->hasMany(Request::class, 'hall_id'); }
}
