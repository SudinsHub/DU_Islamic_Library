<?php

namespace App\Models;

use Illuminate\Container\Attributes\Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
class Volunteer extends Authenticatable
{
        /** @use HasFactory<\Database\Factories\ReaderFactory> */
        use HasFactory, HasApiTokens, HasUuids;

        protected $primaryKey = 'volunteer_id';
        protected $keyType = 'string';
        public $incrementing = false;

    
        /**
         * The attributes that are mass assignable.
         *
         * @var array<int, string>
         */
        protected $fillable = [
            'name',
            'registration_no',
            'email',
            'contact',
            'address',
            'hall_id',
            'dept_id',
            'session',
            'password',
            'isAvailable',
            'isVerified',
            'room_no',
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
            'isAvailable' => 'boolean',
            'isVerified' => 'boolean',
            'password' => 'hashed',
        ];

        // VOLUNTEER }|--|| HALL : "belongs to"
        // VOLUNTEER }|--|| DEPARTMENT : "belongs to"
        // VOLUNTEER ||--o{ VOLUNTEER_REVIEW : receives
        // VOLUNTEER ||--o{ LENDING : processes

        public function hall() {
            return $this->belongsTo(Hall::class, 'hall_id', 'hall_id');
        }
        public function department() {
            return $this->belongsTo(Department::class, 'dept_id', 'dept_id');
        }
        public function volunteerReview() {
            return $this->hasMany(VolunteerReview::class);
        }
        public function lending() {
            return $this->hasMany(Lending::class, 'volunteer_id', 'volunteer_id');
        }
    
}
