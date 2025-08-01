<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointSystem extends Model
{
    /** @use HasFactory<\Database\Factories\PointSystemFactory> */
    use HasFactory;
    
    protected $primaryKey = 'activity_type';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    
    protected $fillable = [
        'activity_type',
        'points',
        'description',
    ];
    protected $casts = [
        'points' => 'integer',
    ];
    public function point_history() { return $this->hasMany(PointHistory::class, 'activity_type', 'activity_type'); }
}
