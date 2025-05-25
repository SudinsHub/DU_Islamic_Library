<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReadingHistory extends Model
{
    /** @use HasFactory<\Database\Factories\ReadingHistoryFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'history_id';
    public $incrementing = false;
    protected $keyType = 'string';

    // BOOK ||--o{ READING_HISTORY
    public function book() {
        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }
    // READER ||--o{ READING_HISTORY
    public function reader() {
        return $this->belongsTo(Reader::class, 'reader_id', 'reader_id');
    }
}
