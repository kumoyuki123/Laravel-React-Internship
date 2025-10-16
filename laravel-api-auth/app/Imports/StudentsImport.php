<?php
namespace App\Imports;

use App\Models\Employee;
use App\Models\School;
use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Events\BeforeImport;

class StudentsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, WithBatchInserts, WithChunkReading, SkipsEmptyRows, WithEvents
{
    use SkipsFailures;

    private $rows        = 0;
    private $skippedRows = [];
    private $schoolsMap  = [];

    public function collection(Collection $rows)
    {
        $this->prepareSchools($rows);
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1;
            try {
                $this->processRow($row, $rowNumber);
            } catch (\Exception $e) {
                $this->skippedRows[] = [
                    'row'    => $rowNumber,
                    'errors' => [$e->getMessage()],
                    'values' => $row->toArray(),
                ];
                continue;
            }
        }
    }

    /**
     * Reset counters once at the beginning of the import.
     */
    public function registerEvents(): array
    {
        return [
            BeforeImport::class => function () {
                $this->rows        = 0;
                $this->skippedRows = [];
                $this->schoolsMap  = [];
            },
        ];
    }

    private function prepareSchools(Collection $rows)
    {
        $schoolNames = $rows->pluck('school')->unique()->filter();

        if ($schoolNames->isEmpty()) {
            return;
        }

        $existingSchools  = School::whereIn('name', $schoolNames)->pluck('id', 'name');
        $this->schoolsMap = $existingSchools->toArray();

        $newSchoolNames = $schoolNames->diff($existingSchools->keys());

        foreach ($newSchoolNames as $schoolName) {
            $school = School::create([
                'name'          => $schoolName,
                'teacher_name'  => 'Default Teacher',
                'teacher_email' => null,
            ]);
            $this->schoolsMap[$schoolName] = $school->id;
        }
    }

    private function processRow($row, $rowNumber)
    {
        $requiredFields = ['school', 'roll_no', 'branch', 'name', 'email', 'nrc_no', 'phone', 'major', 'year', 'iq_score'];
        foreach ($requiredFields as $field) {
            if (empty($row[$field])) {
                throw new \Exception("Field '{$field}' is required and cannot be empty.");
            }
        }
        $schoolId = $this->schoolsMap[$row['school']] ?? null;
        if (! $schoolId) {
            throw new \Exception("School '{$row['school']}' not found.");
        }
        $studentData = [
            'school_id' => $schoolId,
            'roll_no'   => trim((string) $row['roll_no']),
            'branch'   => trim((string) $row['branch']),
            'name'      => trim((string) $row['name']),
            'nrc_no'    => trim((string) $row['nrc_no']),
            'email'     => trim((string) $row['email']),
            'phone'     => trim((string) $row['phone']),
            'major'     => trim((string) $row['major']),
            'year'      => trim((string) $row['year']),
            'iq_score'  => (int) $row['iq_score'],
        ];

        $existingByNrc    = Student::where('nrc_no', $studentData['nrc_no'])->first();
        $existingByEmail  = Student::where('email', $studentData['email'])->first();
        $existingByRollNo = Student::where('school_id', $schoolId)
            ->where('year', $studentData['year'])
            ->where('roll_no', $studentData['roll_no'])
            ->first();

        // Case 1: Same NRC AND same email AND same data = Duplicate import
        if ($existingByNrc && $existingByEmail &&
            $existingByNrc->id === $existingByEmail->id &&
            $this->isSameStudentData($existingByNrc, $studentData)) {
            throw new \Exception("Duplicate data occurred!");
        }

        // Case 2: Same NRC but different email (conflict)
        if ($existingByNrc && $existingByEmail && $existingByNrc->id !== $existingByEmail->id) {
            throw new \Exception("NRC Number '{$studentData['nrc_no']}' belongs to one student but email '{$studentData['email']}' belongs to another student.");
        }

        // Case 3: Same NRC but email belongs to different student
        if ($existingByNrc && $existingByEmail && $existingByNrc->id !== $existingByEmail->id) {
            throw new \Exception("NRC Number is same record!");
        }

        // Case 4: Same email but NRC belongs to different student
        if ($existingByEmail && $existingByNrc && $existingByEmail->id !== $existingByNrc->id) {
            throw new \Exception("Email is same record!");
        }

        // Case 5: Same roll number in same school and year (for new student or different student)
        if ($existingByRollNo) {
            if ((! $existingByNrc || $existingByNrc->id !== $existingByRollNo->id) &&
                (! $existingByEmail || $existingByEmail->id !== $existingByRollNo->id)) {
                throw new \Exception("Roll Number '{$studentData['roll_no']}' already exists for school '{$row['school']}' in year '{$studentData['year']}'.");
            }
        }

        if ($existingByNrc) {
            $existingByNrc->update($studentData);
            $student = $existingByNrc;
        } elseif ($existingByEmail) {
            $existingByEmail->update($studentData);
            $student = $existingByEmail;
        } else {
            $student = Student::create($studentData);
        }
        $this->handleEmployee($student);

        $this->rows++;
    }

    /**
     * Check if the existing student data matches the import data
     */
    private function isSameStudentData($existingStudent, $newData)
    {
        return $existingStudent->school_id == $newData['school_id'] &&
        $existingStudent->roll_no == $newData['roll_no'] &&
        $existingStudent->branch == $newData['branch'] &&
        $existingStudent->name == $newData['name'] &&
        $existingStudent->email == $newData['email'] &&
        $existingStudent->nrc_no == $newData['nrc_no'] &&
        $existingStudent->phone == $newData['phone'] &&
        $existingStudent->major == $newData['major'] &&
        $existingStudent->year == $newData['year'] &&
        $existingStudent->iq_score == $newData['iq_score'];
    }

    private function handleEmployee(Student $student)
    {
        $existingEmployee = $student->employee;

        if ($student->iq_score >= 60) {
            $employeeData = [
                'student_id' => $student->id,
                'school_id'  => $student->school_id,
                'iq_score'   => $student->iq_score,
            ];

            if ($existingEmployee) {
                $existingEmployee->update($employeeData);
            } else {
                Employee::create($employeeData + [
                    'jp_level'       => null,
                    'skill_language' => null,
                ]);
            }
        } elseif ($existingEmployee) {
            $existingEmployee->delete();
        }
    }

    public function rules(): array
    {
        // These rules are good for basic format validation before processing
        return [
            '*.school'   => ['required', 'string', 'max:255'],
            '*.roll_no'  => ['required', 'string', 'max:50'],
            '*.branch'  => ['required', 'string', 'max:50'],
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

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}
