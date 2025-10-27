<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookCollection extends Model
{
    /** @use HasFactory<\Database\Factories\BookCollectionFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'collection_id';
    public $incrementing = false;
    protected $keyType = 'string';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'book_id',
        'hall_id',
        'available_copies',
        'total_copies',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'available_copies' => 'integer',
        'total_copies' => 'integer',
    ];
    
    public function book() { return $this->belongsTo(Book::class, 'book_id'); }
    public function hall() { return $this->belongsTo(Hall::class, 'hall_id'); }
    
    
}
