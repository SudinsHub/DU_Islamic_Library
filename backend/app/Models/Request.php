<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Request extends Model
{
    /** @use HasFactory<\Database\Factories\RequestFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'req_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'reader_id',
        'book_id',
        'hall_id',
        'lending_id',
        'request_date',
        'status',
    ];

    protected $casts = [
        'request_date' => 'date',
        // No casting for 'status' enum directly needed, Laravel handles it fine with validation
    ];

    /**
     * Scope a query to only include pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include fulfilled requests.
     */
    public function scopeFulfilled($query)
    {
        return $query->where('status', 'fulfilled');
    }

    /**
     * Scope a query to only include cancelled requests.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
    //     READER ||--o{ REQUEST : places
    // HALL ||--o{ REQUEST : "receives"
    //     REQUEST ||--|| LENDING : "fulfilled by"
    //     BOOK ||--o{ REQUEST : "requested in"
    public function reader() {
        return $this->belongsTo(Reader::class, 'reader_id', 'reader_id');
    }
    public function book() {
        return $this->belongsTo(Book::class, 'book_id', 'book_id');
    }
    public function hall() {
        return $this->belongsTo(Hall::class, 'hall_id', 'hall_id');
    }
    public function lending() {
        return $this->hasOne(Lending::class, 'req_id', 'req_id');
    }

}
