<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'student_id',
        'school_id',
        'iq_score',
        'jp_level',
        'skill_language'
    ];

    public function student() {
        return $this->belongsTo(Student::class);
    }

    public function school() {
        return $this->belongsTo(School::class);
    }
}
