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
        // Get MIIT school
        $miitSchool = School::where('name', 'MIIT')->first();
        
        if ($miitSchool) {
            // Create the student mentioned in requirements
            $student = Student::create([
                'school_id' => $miitSchool->id,
                'roll_no' => '9',
                'name' => 'Phyu Phyu',
                'email' => 'phyuphyu@gmail.com',
                'nrc_no' => '9/MaHaMa(N)456456',
                'phone' => '09-979789609',
                'major' => 'EC',
                'year' => 'First Year',
                'iq_score' => 69,
            ]);

            // Since IQ score is 69 (>= 60), automatically create employee
            Employee::create([
                'student_id' => $student->id,
                'school_id' => $student->school_id,
                'iq_score' => $student->iq_score,
                'jp_level' => null,
                'skill_language' => null,
            ]);
        }

        // Create additional test students
        $schools = School::all();
        
        foreach ($schools as $school) {
            // Create a student with high IQ (will become employee)
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

            // Auto-create employee for high IQ student
            Employee::create([
                'student_id' => $highIqStudent->id,
                'school_id' => $highIqStudent->school_id,
                'iq_score' => $highIqStudent->iq_score,
                'jp_level' => 'N3',
                'skill_language' => 'PHP, JavaScript',
            ]);

            // Create a student with low IQ (will not become employee)
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
