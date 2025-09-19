<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\School;

class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create MIIT school as mentioned in requirements
        School::create([
            'name' => 'MIIT',
            'teacher_name' => 'Daw YiYi',
            'teacher_email' => 'yiyi@gmail.com',
        ]);

        // Create additional test schools
        School::create([
            'name' => 'University of Computer Studies',
            'teacher_name' => 'Dr. Thant Zin',
            'teacher_email' => 'thantzin@ucs.edu.mm',
        ]);

        School::create([
            'name' => 'Yangon Technological University',
            'teacher_name' => 'Prof. Mya Mya',
            'teacher_email' => 'myamya@ytu.edu.mm',
        ]);
    }
}
