<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'book_id';
    public $incrementing = false;
    protected $keyType = 'string';
    // public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'publisher_id',
        'author_id',
        'category_id',
        'title',
        'description',
        'image_url', 

    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // No specific casts needed unless you want to cast something else
    ];

    public function author() { return $this->belongsTo(Author::class, 'author_id'); }
    public function publisher() { return $this->belongsTo(Publisher::class, 'publisher_id'); }
    public function category() { return $this->belongsTo(Category::class, 'category_id'); }
    
    public function book_collection() { return $this->hasMany(BookCollection::class, 'book_id', 'book_id'); }
    public function request() { return $this->hasMany(Request::class, 'book_id', 'book_id'); }
    public function wishlist() { return $this->hasMany(Wishlist::class, 'book_id', 'book_id'); }
    public function reading_history() { return $this->hasMany(ReadingHistory::class, 'book_id', 'book_id'); }
    public function review() { return $this->hasMany(Review::class, 'book_id', 'book_id'); }
    public function point_history() { return $this->hasMany(PointHistory::class, 'book_id', 'book_id'); }
}

