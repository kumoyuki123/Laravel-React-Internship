<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendence extends Model
{
    protected $fillable = [
        'student_id',
        'date',
        'status',
        'check_in_time',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
