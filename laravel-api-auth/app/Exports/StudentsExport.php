<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Student::with(['school', 'employee'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'School',
            'Roll No',
            'Name',
            'Email',
            'NRC No',
            'Phone',
            'Major',
            'Year',
            'IQ Score',
            'Is Employee',
            'Created At',
            'Updated At',
        ];
    }

    public function map($student): array
    {
        return [
            $student->id,
            $student->school ? $student->school->name : '',
            $student->roll_no,
            $student->name,
            $student->email,
            $student->nrc_no, // Fixed: was $student->nrc
            $student->phone,
            $student->major,
            $student->year,
            $student->iq_score,
            $student->employee ? 'Yes' : 'No',
            $student->created_at->toDateTimeString(),
            $student->updated_at->toDateTimeString(),
        ];
    }
}