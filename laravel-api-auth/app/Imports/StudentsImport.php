<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\School;
use App\Models\Employee;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeImport;
use Illuminate\Validation\Rule;

class StudentsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, WithBatchInserts, WithChunkReading, SkipsEmptyRows
{
    use SkipsFailures;

    private $rows = 0;
    private $skippedRows = [];
    private $schoolsMap = [];

    public function collection(Collection $rows)
    {
        // Reset counters
        $this->rows = 0;
        $this->skippedRows = [];
        
        // 1. Get unique school names and prepare schools
        $this->prepareSchools($rows);
        
        // 2. Process each row
        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row, $index + 2); // +2 because: 1 for header, 1 for 0-based index
            } catch (\Exception $e) {
                $this->skippedRows[] = [
                    'row' => $index + 2,
                    'errors' => [$e->getMessage()],
                    'values' => $row->toArray()
                ];
                continue;
            }
        }
    }

    private function prepareSchools(Collection $rows)
    {
        $schoolNames = $rows->pluck('school')->unique()->filter();
        
        if ($schoolNames->isEmpty()) {
            return;
        }

        // Find existing schools
        $existingSchools = School::whereIn('name', $schoolNames)->get();
        foreach ($existingSchools as $school) {
            $this->schoolsMap[$school->name] = $school->id;
        }

        // Create new schools
        $newSchoolNames = $schoolNames->diff(array_keys($this->schoolsMap));
        
        foreach ($newSchoolNames as $schoolName) {
            $school = School::create([
                'name' => $schoolName,
                'teacher_name' => 'Default Teacher',
                'teacher_email' => null,
            ]);
            $this->schoolsMap[$schoolName] = $school->id;
        }
    }

    private function processRow($row, $rowNumber)
    {
        // Validate required fields
        $requiredFields = ['school', 'roll_no', 'name', 'email', 'nrc_no', 'phone', 'major', 'year', 'iq_score'];
        foreach ($requiredFields as $field) {
            if (!isset($row[$field]) || empty($row[$field])) {
                throw new \Exception("Field '{$field}' is required");
            }
        }

        $schoolId = $this->schoolsMap[$row['school']] ?? null;
        
        if (!$schoolId) {
            throw new \Exception("School '{$row['school']}' not found or could not be created");
        }

        // Prepare student data
        $studentData = [
            'school_id' => $schoolId,
            'roll_no'   => (string) $row['roll_no'],
            'name'      => $row['name'],
            'nrc_no'    => $row['nrc_no'],
            'email'     => $row['email'],
            'phone'     => (string) $row['phone'],
            'major'     => $row['major'],
            'year'      => (string) $row['year'],
            'iq_score'  => (int) $row['iq_score'],
        ];

        // Check if student exists
        $existingStudent = Student::where('email', $studentData['email'])->first();

        if ($existingStudent) {
            // Update existing student
            $existingStudent->update($studentData);
            $student = $existingStudent;
        } else {
            // Create new student
            $student = Student::create($studentData);
        }

        // Handle employee record
        $this->handleEmployee($student);

        $this->rows++;
    }

    private function handleEmployee(Student $student)
    {
        $existingEmployee = $student->employee;

        if ($student->iq_score >= 60) {
            if ($existingEmployee) {
                // Update existing employee
                $existingEmployee->update([
                    'school_id' => $student->school_id,
                    'iq_score' => $student->iq_score
                ]);
            } else {
                // Create new employee
                Employee::create([
                    'student_id' => $student->id,
                    'school_id' => $student->school_id,
                    'iq_score' => $student->iq_score,
                    'jp_level' => null,
                    'skill_language' => null
                ]);
            }
        } elseif ($existingEmployee) {
            // Delete employee if IQ score is below 60
            $existingEmployee->delete();
        }
    }

    public function rules(): array
    {
        return [
            '*.school'   => ['required', 'string', 'max:255'],
            '*.roll_no'  => ['required', 'string', 'max:50'],
            '*.name'     => ['required', 'string', 'max:255'],
            '*.nrc_no'   => ['required', 'string', 'max:100'],
            '*.email'    => ['required', 'email', 'max:255'],
            '*.phone'    => ['required', 'max:20'],
            '*.major'    => ['required', 'string', 'max:100'],
            '*.year'     => ['required', 'max:50'],
            '*.iq_score' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function getRowCount(): int
    {
        return $this->rows;
    }

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}