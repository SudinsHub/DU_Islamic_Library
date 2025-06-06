<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lending extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'lending_id';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'volunteer_id',
        'req_id',
        'issue_date',
        'return_date',
        'status',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'return_date' => 'date',
    ];

    //     VOLUNTEER ||--o{ LENDING : processes
    // REQUEST ||--|| LENDING : "fulfilled by"

    public function request() {
        return $this->belongsTo(Request::class, 'req_id', 'req_id');
    }
    public function volunteer() {
        return $this->belongsTo(Volunteer::class, 'volunteer_id', 'volunteer_id');
    }
    

}
