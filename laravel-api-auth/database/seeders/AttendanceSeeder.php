<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Attendence;
use App\Models\Student;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = Student::all();
        $statuses = ['present', 'absent', 'late'];
        
        foreach ($students as $student) {
            // Create attendance records for 30 days
            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $status = $statuses[array_rand($statuses)];

                $dayOfWeek = Carbon::parse($date)->dayOfWeek;
                if ($dayOfWeek == Carbon::SATURDAY || $dayOfWeek == Carbon::SUNDAY) {
                    continue;
                }
                
                $checkInTime = null;
                if ($status === 'present') {
                    $checkInTime = '07:' . rand(0, 59) . ':' . rand(0, 59);
                } elseif ($status === 'late') {
                    $checkInTime = '08:' . rand(0, 59) . ':' . rand(0, 59);
                }
                
                Attendence::create([
                    'student_id' => $student->id,
                    'date' => $date,
                    'status' => $status,
                    'check_in_time' => $checkInTime,
                ]);
            }
        }
    }
}
