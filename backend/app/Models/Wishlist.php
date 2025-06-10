<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    /** @use HasFactory<\Database\Factories\WishlistFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'wish_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'book_id',
    ];
    protected $casts = [
        'book_id' => 'string',
        'reader_id' => 'string',
    ];

    //     BOOK ||--o{ WISHLIST : "added to"
    public function book() {
        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }
    //     READER ||--o{ WISHLIST : adds
    public function reader() {
        return $this->belongsTo(Reader::class, 'reader_id', 'reader_id');
    }
}
