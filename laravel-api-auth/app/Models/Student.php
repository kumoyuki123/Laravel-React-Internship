<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'school_id',
        'roll_no',
        'name',
        'email',
        'nrc_no',
        'phone',
        'major',
        'year',
        'iq_score'
    ];

    public function school() {
        return $this->belongsTo(School::class);
    }

    public function employee() {
        return $this->hasOne(Employee::class);
    }

    public function attendances(){
        return $this->hasMany(Attendence::class);
    }
}
