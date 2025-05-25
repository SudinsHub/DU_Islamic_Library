<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    /** @use HasFactory<\Database\Factories\DepartmentFactory> */
    use HasFactory, HasUuids;

    protected $primaryKey = 'dept_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $fillable = [
        'name',
    ];
    public function reader() { return $this->hasMany(Reader::class, 'dept_id', 'dept_id'); }
    public function volunteer() { return $this->hasMany(Volunteer::class, 'dept_id', 'dept_id'); }
}
