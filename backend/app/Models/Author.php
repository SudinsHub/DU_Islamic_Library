<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Author extends Model
{
    /** @use HasFactory<\Database\Factories\AuthorFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'author_id';
    public $incrementing = false;
    protected $keyType = 'string';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    // Your migration does not include timestamps for this table.
    // If you don't want Laravel to manage `created_at` and `updated_at`,
    // you should explicitly disable them:
    public $timestamps = false;

    public function book() { return $this->hasMany(Book::class, 'author_id', 'author_id'); }
}
