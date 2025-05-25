<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'review_id';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;
    protected $fillable = [
        'reader_id',
        'book_id',
        'rating',
        'comment',
        'reviewed_on',
    ];
    protected $casts = [
        'reviewed_on' => 'date',
    ];

    //     BOOK ||--o{ REVIEW : "has"
    public function book() {
        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }
    //     READER ||--o{ REVIEW : writes
    public function reader() {
        return $this->belongsTo(Reader::class, 'reader_id', 'reader_id');
    }
}
