<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointHistory extends Model
{
    /** @use HasFactory<\Database\Factories\PointHistoryFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'point_id';
    public $incrementing = false;
    protected $keyType = 'string';
    // point_id

    public function reader() { return $this->belongsTo(Reader::class, 'reader_id', 'reader_id'); }
    public function point_system() { return $this->belongsTo(PointSystem::class, 'activity_type', 'activity_type'); }
    public function book() { return $this->belongsTo(Book::class, 'book_id', 'book_id'); }
}
