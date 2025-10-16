<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\School;
use App\Models\Employee;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schools = School::all();
        foreach ($schools as $school) {
            $highIqStudent = Student::create([
                'school_id' => $school->id,
                'roll_no' => 'S' . $school->id . '001',
                'name' => 'Aung Aung ' . $school->id,
                'email' => 'aungaung' . $school->id . '@example.com',
                'nrc_no' => '12/YaKaNa(N)12345' . $school->id,
                'phone' => '09-12345678' . $school->id,
                'major' => 'IT',
                'year' => 'Second Year',
                'iq_score' => 75,
            ]);

            Employee::create([
                'student_id' => $highIqStudent->id,
                'school_id' => $highIqStudent->school_id,
                'iq_score' => $highIqStudent->iq_score,
                'jp_level' => 'N3',
                'skill_language' => 'PHP, JavaScript',
            ]);

            Student::create([
                'school_id' => $school->id,
                'roll_no' => 'S' . $school->id . '002',
                'name' => 'Mya Mya ' . $school->id,
                'email' => 'myamya' . $school->id . '@example.com',
                'nrc_no' => '12/YaKaNa(N)54321' . $school->id,
                'phone' => '09-87654321' . $school->id,
                'major' => 'Civil',
                'year' => 'Third Year',
                'iq_score' => 45,
            ]);
        }
    }
}
