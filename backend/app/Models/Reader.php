<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Reader extends Model
{
    /** @use HasFactory<\Database\Factories\ReaderFactory> */
    use HasFactory, HasApiTokens, HasUuids;

    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $primaryKey = 'reader_id';

    // Indicate that the primary key is not auto-incrementing
    public $incrementing = false; 

    // Specify the key type as string
    protected $keyType = 'string'; 

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'registration_no',
        'session',
        'email',
        'contact',
        'hall_id',
        'dept_id',
        'password',
        'isVerified',
        'total_points',
        'gender',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'isVerified' => 'boolean',
        'total_points' => 'integer',
        'password' => 'hashed',
    ];

    // one to many
    public function requests() {
        return $this->hasMany(Request::class, 'reader_id', 'reader_id');
    }
    
    public function wishlists() {
        return $this->hasMany(Wishlist::class, 'reader_id', 'reader_id');
    }
    
    public function readingHistories() {
        return $this->hasMany(ReadingHistory::class, 'reader_id', 'reader_id');
    }
    
    public function reviews() {
        return $this->hasMany(Review::class, 'reader_id', 'reader_id');
    }
    
    public function pointHistories() {
        return $this->hasMany(PointHistory::class, 'reader_id', 'reader_id');
    }

    // many to one 
    public function hall() {
        return $this->belongsTo(Hall::class, 'hall_id', 'hall_id');
    }
    
    public function department() {
        return $this->belongsTo(Department::class, 'dept_id', 'dept_id');
    }


    
}
