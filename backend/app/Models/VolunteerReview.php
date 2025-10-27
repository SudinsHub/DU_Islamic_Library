<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class VolunteerReview extends Model
{
    use HasUuids;

    protected $primaryKey = 'volRev_id';
    protected $keyType = 'string';
    public $incrementing = false;

    // VOLUNTEER ||--o{ VOLUNTEER_REVIEW : receives
    public function volunteer() {
        return $this->belongsTo(Volunteer::class);
    }
}
